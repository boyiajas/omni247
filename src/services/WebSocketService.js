import { useEffect, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../config/config';

class WebSocketService {
  constructor() {
    this.echo = null;
    this.subscriptions = new Map();
  }

  async initialize() {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      
      if (!token) {
        console.log('No auth token found for WebSocket');
        return;
      }

      // Initialize Pusher
      window.Pusher = Pusher;

      const wsHost = config.REVERB_HOST || 'omni-247.com';
      const wsPort = Number(config.REVERB_PORT || 443);
      const forceTLS = (config.WS_URL || '').startsWith('wss') || config.ENV === 'production';

      this.echo = new Echo({
        broadcaster: 'pusher',
        key: config.REVERB_APP_KEY || 'local',
        cluster: 'mt1',
        wsHost,
        wsPort,
        wssPort: wsPort,
        forceTLS,
        encrypted: forceTLS,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
        authEndpoint: `${config.API_URL}/broadcasting/auth`,
        auth: {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      });

      console.log('WebSocket initialized successfully');
    } catch (error) {
      console.error('WebSocket initialization error:', error);
    }
  }

  subscribeToReports(callback) {
    if (!this.echo) return;

    const channel = this.echo.channel('reports.global');
    
    channel.listen('.new.report', (data) => {
      callback('new_report', data);
    });

    this.subscriptions.set('reports.global', channel);
  }

  subscribeToLocation(latitude, longitude, callback) {
    if (!this.echo) return;

    const gridX = Math.floor(latitude * 100);
    const gridY = Math.floor(longitude * 100);
    const channelName = `location.${gridX}.${gridY}`;
    
    const channel = this.echo.channel(channelName);
    
    channel.listen('.new.report', (data) => {
      callback('nearby_report', data);
    });

    this.subscriptions.set(channelName, channel);
  }

  subscribeToReport(reportId, callback) {
    if (!this.echo) return;

    const channelName = `report.${reportId}`;
    
    const channel = this.echo.channel(channelName);
    
    channel.listen('.report.updated', (data) => {
      callback('report_updated', data);
    });

    channel.listen('.report.comment', (data) => {
      callback('new_comment', data);
    });

    channel.listen('.report.rating', (data) => {
      callback('new_rating', data);
    });

    this.subscriptions.set(channelName, channel);
  }

  subscribeToCategory(categoryId, callback) {
    if (!this.echo) return;

    const channelName = `reports.${categoryId}`;
    
    const channel = this.echo.channel(channelName);
    
    channel.listen('.new.report', (data) => {
      callback('category_report', data);
    });

    channel.listen('.report.updated', (data) => {
      callback('category_update', data);
    });

    this.subscriptions.set(channelName, channel);
  }

  unsubscribe(channelName) {
    const channel = this.subscriptions.get(channelName);
    if (channel) {
      channel.unsubscribe();
      this.subscriptions.delete(channelName);
    }
  }

  unsubscribeAll() {
    this.subscriptions.forEach((channel, channelName) => {
      channel.unsubscribe();
    });
    this.subscriptions.clear();
  }

  disconnect() {
    if (this.echo) {
      this.echo.disconnect();
      this.echo = null;
    }
    this.unsubscribeAll();
  }
}

// Singleton instance
let instance = null;

export const getWebSocketService = () => {
  if (!instance) {
    instance = new WebSocketService();
  }
  return instance;
};

// React Hook for WebSocket
export const useWebSocket = (subscriptions = [], dependencies = []) => {
  const webSocketService = useRef(null);

  useEffect(() => {
    const initWebSocket = async () => {
      webSocketService.current = getWebSocketService();
      await webSocketService.current.initialize();
    };

    initWebSocket();

    return () => {
      if (webSocketService.current) {
        webSocketService.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (!webSocketService.current?.echo) return;

    // Setup subscriptions based on props
    subscriptions.forEach(sub => {
      switch (sub.type) {
        case 'reports':
          webSocketService.current.subscribeToReports(sub.callback);
          break;
        case 'location':
          webSocketService.current.subscribeToLocation(
            sub.latitude,
            sub.longitude,
            sub.callback
          );
          break;
        case 'report':
          webSocketService.current.subscribeToReport(
            sub.reportId,
            sub.callback
          );
          break;
        case 'category':
          webSocketService.current.subscribeToCategory(
            sub.categoryId,
            sub.callback
          );
          break;
      }
    });

    return () => {
      // Cleanup subscriptions
      subscriptions.forEach(sub => {
        switch (sub.type) {
          case 'reports':
            webSocketService.current?.unsubscribe('reports.global');
            break;
          case 'location':
            const gridX = Math.floor(sub.latitude * 100);
            const gridY = Math.floor(sub.longitude * 100);
            webSocketService.current?.unsubscribe(`location.${gridX}.${gridY}`);
            break;
          case 'report':
            webSocketService.current?.unsubscribe(`report.${sub.reportId}`);
            break;
          case 'category':
            webSocketService.current?.unsubscribe(`reports.${sub.categoryId}`);
            break;
        }
      });
    };
  }, dependencies);
};
