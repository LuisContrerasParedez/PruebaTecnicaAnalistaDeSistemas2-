import jwt from 'jsonwebtoken';

const accessTTL = process.env.JWT_ACCESS_TTL || '15m';
const refreshTTL = process.env.JWT_REFRESH_TTL || '30d';

export const signAccess  = (p) => jwt.sign(p, process.env.JWT_ACCESS_SECRET,  { expiresIn: accessTTL });
export const verifyAccess = (t) => jwt.verify(t, process.env.JWT_ACCESS_SECRET);

export const signRefresh = (p) => jwt.sign(p, process.env.JWT_REFRESH_SECRET, { expiresIn: refreshTTL });
export const verifyRefresh = (t) => jwt.verify(t, process.env.JWT_REFRESH_SECRET);
