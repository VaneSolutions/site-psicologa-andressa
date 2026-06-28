const { getTokenFromRequest, sendJson } = require("./_auth");

module.exports = function handler(req, res) {
  sendJson(res, 200, { authenticated: Boolean(getTokenFromRequest(req)) });
};
