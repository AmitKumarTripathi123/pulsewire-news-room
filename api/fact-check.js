const { handleFactCheckRequest } = require("../server.js");

module.exports = async (req, res) => {
  return handleFactCheckRequest(req, res);
};
