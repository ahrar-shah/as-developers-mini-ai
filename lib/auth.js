// lib/auth.js
import jwt from 'jsonwebtoken';
import cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_NAME = 'chat_token';

export function signToken(payload, opts = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: opts.expiresIn || '30d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function setTokenCookie(res, token) {
  const cookieStr = cookie.serialize(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  });
  res.setHeader('Set-Cookie', cookieStr);
}

export function removeTokenCookie(res) {
  const cookieStr = cookie.serialize(TOKEN_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(0)
  });
  res.setHeader('Set-Cookie', cookieStr);
}

export function parseTokenFromReq(req) {
  const cookies = req.headers.cookie;
  if (!cookies) return null;
  const parsed = cookie.parse(cookies);
  return parsed[TOKEN_NAME] || null;
}
