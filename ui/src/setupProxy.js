const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // 代理所有以/api开头的请求
  app.use(
    ["/api", "/unauth_api", "/admin_api"],
    createProxyMiddleware({
      target: process.env.REACT_APP_API_URL,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api',
        '^/unauth_api': '/api',
        '^/admin_api': '/api'
      }
    })
  );
};
