const { handleFeedProxy } = require("../server.js");

module.exports = async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  return handleFeedProxy(req, res, requestUrl);
};
