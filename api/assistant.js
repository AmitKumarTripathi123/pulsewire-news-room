const { handleAssistantRequest } = require("../server.js");

module.exports = async (req, res) => {
  return handleAssistantRequest(req, res);
};
