const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // 代理所有以/api开头的请求
  const targetBase = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  app.use(
    ["/api", "/unauth_api", "/admin_api"],
    createProxyMiddleware({
      target: targetBase,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api',
        '^/unauth_api': '/api',
        '^/admin_api': '/api'
      }
    })
  );
};
