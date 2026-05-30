import axios from 'axios';

axios.defaults.baseURL = process.env.AIVISION_SERVICE_URL ?? 'http://localhost:6006';
axios.defaults.validateStatus = () => true;
