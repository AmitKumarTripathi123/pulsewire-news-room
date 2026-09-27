const { handleInsight } = require("../server.js");

module.exports = async (req, res) => {
  return handleInsight(req, res);
};
