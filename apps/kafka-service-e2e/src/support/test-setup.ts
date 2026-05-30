import axios from 'axios';

axios.defaults.baseURL = process.env.KAFKA_SERVICE_URL ?? 'http://localhost:3000';
axios.defaults.validateStatus = () => true;
