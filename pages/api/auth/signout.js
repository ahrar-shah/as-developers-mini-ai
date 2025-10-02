// pages/api/auth/signout.js
import { removeTokenCookie } from '../../../lib/auth';

export default async function handler(req, res) {
  removeTokenCookie(res);
  return res.status(200).json({ ok: true });
}
