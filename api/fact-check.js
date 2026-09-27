const { handleFactCheckRequest } = require("../server.js");

module.exports = async (req, res) => {
  try {
    return await handleFactCheckRequest(req, res);
  } catch (err) {
    console.error("api/fact-check error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err.message || "Fact check error" }));
  }
};
