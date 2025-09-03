const PROXY_CONFIG = [
  {
    context: ["/v1", "/auth"],
    target: "http://localhost:8080",
    secure: false,
    changeOrigin: true,
    logLevel: "debug"
  }
];
module.exports = PROXY_CONFIG;
