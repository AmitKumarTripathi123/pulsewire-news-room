const { handleAssistantRequest } = require("../server.js");

module.exports = async (req, res) => {
  try {
    return await handleAssistantRequest(req, res);
  } catch (err) {
    console.error("api/assistant error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: err.message || "Assistant error" }));
  }
};
