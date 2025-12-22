// src/services/api/ApiClient.js
import axios from 'axios';
import config from '../../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const client = axios.create({
  baseURL: config.API_URL,
  timeout: config.TIMEOUT || 30000,
  headers: {
    Accept: 'application/json',
  },
});

client.interceptors.request.use(
  async (cfg) => {
    const token =
      (await AsyncStorage.getItem('authToken')) ||
      (await AsyncStorage.getItem('token')) ||
      (await AsyncStorage.getItem('access_token'));

    if (token) {
      cfg.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      '[API REQUEST]',
      (cfg.method || '').toUpperCase(),
      `${cfg.baseURL}${cfg.url}`
    );

    return cfg;
  },
  (error) => Promise.reject(error)
);

client.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response) {
      console.log(
        '[API ERROR]',
        error.response.status,
        error.config?.url,
        error.response.data
      );
    } else {
      console.log('[API NETWORK ERROR]', error.message, error.config?.url);
    }
    return Promise.reject(error);
  }
);

const ApiClient = {
  get: (url, cfg) => client.get(url, cfg),
  post: (url, data, cfg) => client.post(url, data, cfg),
  put: (url, data, cfg) => client.put(url, data, cfg),
  delete: (url, cfg) => client.delete(url, cfg),

  // Use native fetch for file uploads - axios has known issues with React Native FormData
  upload: async (url, formData, onProgress) => {
    const token =
      (await AsyncStorage.getItem('authToken')) ||
      (await AsyncStorage.getItem('token')) ||
      (await AsyncStorage.getItem('access_token'));

    const fullUrl = `${config.API_URL}${url}`;

    console.log('[UPLOAD] Fetching:', fullUrl);
    console.log('[UPLOAD] Token present:', !!token);

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          // Don't set Content-Type - fetch sets it with correct boundary for FormData
        },
        body: formData,
      });

      const text = await response.text();
      console.log('[UPLOAD] Response status:', response.status);
      console.log('[UPLOAD] Response body:', text.substring(0, 200));

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Server returned non-JSON: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        const error = new Error(data?.message || 'Upload failed');
        error.response = { status: response.status, data };
        throw error;
      }

      return { data };
    } catch (error) {
      console.error('[UPLOAD] Error:', error.message);
      throw error;
    }
  },
};

export default ApiClient;
