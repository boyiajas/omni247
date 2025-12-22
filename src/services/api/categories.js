import ApiClient from './ApiClient';
import config from '../../config/api';

const categoriesAPI = {
  getCategories: () => ApiClient.get(config.ENDPOINTS.CATEGORIES),
};

export default categoriesAPI;
