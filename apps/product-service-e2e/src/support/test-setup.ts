import axios from 'axios';

axios.defaults.baseURL = process.env.PRODUCT_SERVICE_URL ?? 'http://localhost:6002';
axios.defaults.validateStatus = () => true; // Don't throw on non-2xx
