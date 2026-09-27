const { handleFeedProxy } = require("../server.js");

module.exports = async (req, res) => {
  try {
    const rawUrl = req.url || "/api/feed";
    const host = (req.headers && req.headers.host) ? req.headers.host : "localhost";
    const requestUrl = new URL(rawUrl, `http://${host}`);
    return await handleFeedProxy(req, res, requestUrl);
  } catch (err) {
    console.error("api/feed error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err.message || "Feed proxy error" }));
  }
};
