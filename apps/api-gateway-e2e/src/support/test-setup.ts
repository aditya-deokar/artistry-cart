import axios from 'axios';

axios.defaults.baseURL = process.env.API_GATEWAY_URL ?? 'http://localhost:8080';
axios.defaults.validateStatus = () => true; // Don't throw on non-2xx
