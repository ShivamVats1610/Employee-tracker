// src/config.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:8082';
export default API_BASE_URL;
