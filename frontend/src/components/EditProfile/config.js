let base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8082';

if (base.endsWith('/')) {
  base = base.slice(0, -1);
}

const API_BASE_URL = base;
export default API_BASE_URL;
