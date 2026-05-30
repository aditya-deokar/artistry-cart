import axios from 'axios';

axios.defaults.baseURL = process.env.ORDER_SERVICE_URL ?? 'http://localhost:6004';
axios.defaults.validateStatus = () => true; // Don't throw on non-2xx
