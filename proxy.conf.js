const target = process.env.API_BASE_URL || 'http://localhost:8080';

const PROXY_CONFIG = [
  {
    context: ['/v1', '/auth'],
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  }
];

module.exports = PROXY_CONFIG;