import axios from 'axios';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ?? '6004';

axios.defaults.baseURL = `http://${host}:${port}`;
axios.defaults.validateStatus = () => true; // Don't throw on non-2xx
