const crypto = require("crypto");

const TOKEN_COOKIE = "andressa_admin_token";
const STATE_COOKIE = "andressa_oauth_state";

function getSecret() {
  const secret = process.env.SESSION_SECRET || process.env.GITHUB_CLIENT_SECRET;

  if (!secret) {
    throw new Error("SESSION_SECRET ou GITHUB_CLIENT_SECRET nao configurado.");
  }

  return crypto.createHash("sha256").update(secret).digest();
}

function encryptToken(token) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getSecret(), iv);
  const encrypted = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString("base64url");
}

function decryptToken(value) {
  if (!value) {
    return "";
  }

  const buffer = Buffer.from(value, "base64url");
  const iv = buffer.subarray(0, 12);
  const tag = buffer.subarray(12, 28);
  const encrypted = buffer.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", getSecret(), iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [rawName, ...rawValue] = cookie.trim().split("=");

    if (!rawName) {
      return cookies;
    }

    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
}

function cookieOptions(maxAge) {
  return `Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`;
}

function setCookie(res, name, value, maxAge) {
  const current = res.getHeader("Set-Cookie");
  const nextCookie = `${name}=${encodeURIComponent(value)}; ${cookieOptions(maxAge)}`;

  if (!current) {
    res.setHeader("Set-Cookie", nextCookie);
    return;
  }

  res.setHeader("Set-Cookie", Array.isArray(current) ? [...current, nextCookie] : [current, nextCookie]);
}

function clearCookie(res, name) {
  setCookie(res, name, "", 0);
}

function getTokenFromRequest(req) {
  const cookies = parseCookies(req.headers.cookie);

  try {
    return decryptToken(cookies[TOKEN_COOKIE]);
  } catch (error) {
    return "";
  }
}

function sendJson(res, statusCode, data) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

module.exports = {
  STATE_COOKIE,
  TOKEN_COOKIE,
  clearCookie,
  encryptToken,
  getTokenFromRequest,
  parseCookies,
  sendJson,
  setCookie,
};
