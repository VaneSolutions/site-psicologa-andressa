const { TOKEN_COOKIE, clearCookie, sendJson } = require("./_auth");

module.exports = function handler(req, res) {
  clearCookie(res, TOKEN_COOKIE);
  sendJson(res, 200, { message: "Sessao encerrada." });
};
