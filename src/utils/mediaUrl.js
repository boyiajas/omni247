import config from '../config/config';

const LOCAL_MEDIA_HOSTS = new Set(['127.0.0.1', 'localhost', '10.0.2.2']);

const apiBases = [config.API_URL, ...(config.API_FALLBACK_URLS || [])].filter(Boolean);

const primaryOrigin = (() => {
  for (const base of apiBases) {
    try {
      return new URL(base).origin;
    } catch (_) {
      // ignore malformed URL and continue
    }
  }
  return '';
})();

const normalizePath = (value) => `/${value.replace(/^\/+/, '')}`;

export const resolveMediaUrl = (value) => {
  if (!value || typeof value !== 'string') {
    return null;
  }

  const raw = value.trim();
  if (!raw) {
    return null;
  }

  if (raw.startsWith('//')) {
    return `https:${raw}`;
  }

  if (/^https?:\/\//i.test(raw)) {
    try {
      const parsed = new URL(raw);
      if (!LOCAL_MEDIA_HOSTS.has(parsed.hostname.toLowerCase())) {
        return raw;
      }

      return primaryOrigin ? `${primaryOrigin}${normalizePath(parsed.pathname || '/')}` : raw;
    } catch (_) {
      return raw;
    }
  }

  if (!primaryOrigin) {
    return raw;
  }

  if (raw.startsWith('/storage/')) {
    return `${primaryOrigin}${raw}`;
  }

  if (raw.startsWith('storage/')) {
    return `${primaryOrigin}/${raw}`;
  }

  return `${primaryOrigin}/storage/${raw.replace(/^\/+/, '')}`;
};

export const getReportMediaUrl = (report) => {
  const first = report?.media?.[0];
  if (!first) {
    return null;
  }

  const candidate =
    first.full_url ||
    first.thumbnail_url ||
    first.url ||
    first.file_path ||
    first.path ||
    null;

  return resolveMediaUrl(candidate);
};
