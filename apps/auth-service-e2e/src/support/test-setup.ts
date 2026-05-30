import axios from 'axios';

axios.defaults.baseURL = process.env.AUTH_SERVICE_URL ?? 'http://localhost:6001';
axios.defaults.validateStatus = () => true; // Don't throw on non-2xx
