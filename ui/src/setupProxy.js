const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  // 代理所有以/api开头的请求
  const rawTarget = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

  let target = rawTarget;
  let basePath = "";

  try {
    const parsed = new URL(rawTarget);
    target = `${parsed.protocol}//${parsed.host}`;
    basePath = parsed.pathname.replace(/\/$/, "");
    if (basePath === "/") {
      basePath = "";
    }
  } catch (error) {
    // rawTarget 不是合法URL时保持原状
  }

  const rewritePath = (path) => {
    const normalized = path.replace(/^\/(api|unauth_api|admin_api)/, "/api");
    return `${basePath}${normalized}`;
  };

  app.use(
    ["/api", "/unauth_api", "/admin_api"],
    createProxyMiddleware({
      target,
      changeOrigin: true,
      pathRewrite: rewritePath,
    })
  );
};
