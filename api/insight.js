const { handleInsight } = require("../server.js");

module.exports = async (req, res) => {
  try {
    return await handleInsight(req, res);
  } catch (err) {
    console.error("api/insight error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err.message || "Insight error" }));
  }
};
