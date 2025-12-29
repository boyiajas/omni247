// src/services/api/media.js
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import config from '../../config/api';

const guessMimeFromUri = (uri) => {
  const clean = (uri || '').split('?')[0].toLowerCase();
  if (clean.endsWith('.jpg') || clean.endsWith('.jpeg')) return 'image/jpeg';
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.gif')) return 'image/gif';
  if (clean.endsWith('.mp4')) return 'video/mp4';
  if (clean.endsWith('.mov')) return 'video/quicktime';
  if (clean.endsWith('.avi')) return 'video/x-msvideo';
  if (clean.endsWith('.mp3')) return 'audio/mpeg';
  if (clean.endsWith('.wav')) return 'audio/wav';
  return 'image/jpeg';
};

const normalizeType = (item) => {
  const kind = (item?.kind || item?.type || '').toLowerCase();
  if (kind === 'photo' || kind.startsWith('image')) return 'image';
  if (kind === 'video' || kind.startsWith('video')) return 'video';
  if (kind === 'audio' || kind.startsWith('audio')) return 'audio';
  return 'image';
};

export const mediaAPI = {
  uploadOne: async ({ reportId, item }, onProgress) => {
    const type = normalizeType(item);

    let mime = item?.mimeType || item?.type;
    if (!mime || !mime.includes('/')) mime = guessMimeFromUri(item?.uri);

    let name = item?.fileName || item?.name;
    if (!name) name = `upload-${Date.now()}.${mime.split('/')[1] || 'jpg'}`;

    let uri =
      item?.fileCopyUri
      || item?.uri
      || item?.path
      || item?.filePath
      || item?.originalPath;

    console.log('[MEDIA UPLOAD] Original URI:', uri);

    if (!uri || typeof uri !== 'string') {
      throw new Error('Missing media file path.');
    }

    // ❌ Reject HTTP/HTTPS URLs immediately
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      throw new Error(`Invalid media file path: Cannot upload from URL '${uri}'. Please select a local file.`);
    }

    // ✅ Convert content:// to file:// on Android
    if (Platform.OS === 'android' && uri?.startsWith('content://')) {
      console.log('[MEDIA UPLOAD] Converting content:// URI');
      try {
        const stat = await RNFS.stat(uri);
        console.log('[MEDIA UPLOAD] RNFS.stat result:', stat);

        if (stat?.originalFilepath) {
          uri = stat.originalFilepath;
          console.log('[MEDIA UPLOAD] Using originalFilepath:', uri);
        } else if (stat?.path) {
          uri = stat.path;
          console.log('[MEDIA UPLOAD] Using stat.path:', uri);
        }
      } catch (error) {
        console.log('[MEDIA UPLOAD] RNFS.stat failed, copying file:', error.message);
        const ext = (mime.split('/')[1] || 'jpg').replace('jpeg', 'jpg');
        const destPath = `${RNFS.TemporaryDirectoryPath}/upload-${Date.now()}.${ext}`;
        await RNFS.copyFile(uri, destPath);
        uri = destPath;
        console.log('[MEDIA UPLOAD] Copied to:', uri);
      }
    } else if (uri?.startsWith('file://')) {
      uri = uri.replace('file://', '');
      console.log('[MEDIA UPLOAD] Removed file:// prefix:', uri);
    }

    console.log('[MEDIA UPLOAD] Final filepath:', uri);

    // Get auth token
    const token =
      (await AsyncStorage.getItem('authToken')) ||
      (await AsyncStorage.getItem('token')) ||
      (await AsyncStorage.getItem('access_token'));

    const uploadUrl = `${config.API_URL}${config.ENDPOINTS.UPLOAD_MEDIA}`;

    console.log('[MEDIA UPLOAD] Using RNFS.uploadFiles');
    console.log('[MEDIA UPLOAD] URL:', uploadUrl);
    console.log('[MEDIA UPLOAD] filePath:', uri);
    console.log('[MEDIA UPLOAD] mime:', mime, 'name:', name);
    console.log('[MEDIA UPLOAD] Token:', token ? 'present' : 'missing');

    // ✅ Use RNFS.uploadFiles for native multipart upload
    const uploadResult = await RNFS.uploadFiles({
      toUrl: uploadUrl,
      files: [
        {
          name: 'file',
          filename: name,
          filepath: uri,
          filetype: mime,
        },
      ],
      fields: {
        report_id: String(reportId),
        type: type,
      },
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      method: 'POST',
      progress: (response) => {
        if (onProgress) {
          const percentage = Math.round((response.totalBytesSent / response.totalBytesExpectedToSend) * 100);
          onProgress(percentage);
        }
      },
    }).promise;

    console.log('[MEDIA UPLOAD] Status:', uploadResult.statusCode);
    console.log('[MEDIA UPLOAD] Body:', uploadResult.body?.substring(0, 200));

    if (uploadResult.statusCode !== 200 && uploadResult.statusCode !== 201) {
      throw new Error(uploadResult.body || `Upload failed: ${uploadResult.statusCode}`);
    }

    return { data: JSON.parse(uploadResult.body) };
  },

  uploadMultiple: async (reportId, items = [], onProgress) => {
    const results = [];
    for (let i = 0; i < items.length; i++) {
      console.log(`[MEDIA UPLOAD] Uploading ${i + 1} of ${items.length}`);
      const res = await mediaAPI.uploadOne(
        { reportId, item: items[i] },
        (pct) => {
          if (!onProgress) return;
          const overall = Math.round(((i + pct / 100) / items.length) * 100);
          onProgress(overall);
        }
      );
      results.push(res.data);
    }
    return results;
  },
};
