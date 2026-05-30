import axios from 'axios';

axios.defaults.baseURL = process.env.RECOMMENDATION_SERVICE_URL ?? 'http://localhost:6005';
axios.defaults.validateStatus = () => true; // Don't throw on non-2xx
