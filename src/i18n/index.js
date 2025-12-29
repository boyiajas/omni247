import { translations } from './translations';

const resolvePath = (obj, path) => {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), obj);
};

const applyParams = (text, params) => {
  if (!params) {
    return text;
  }
  return Object.keys(params).reduce((result, key) => {
    return result.replace(new RegExp(`{{${key}}}`, 'g'), String(params[key]));
  }, text);
};

export const translate = (key, language = 'en', params) => {
  const locale = translations[language] || translations.en;
  const fallback = translations.en || {};
  const value = resolvePath(locale, key) ?? resolvePath(fallback, key);
  if (!value) {
    return key;
  }
  return applyParams(value, params);
};

export default translate;
