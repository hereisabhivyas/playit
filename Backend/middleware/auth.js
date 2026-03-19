import jwt from 'jsonwebtoken';

const getJwtSecret = () => process.env.JWT_SECRET || 'change-me-in-production';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Access token missing' });
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret());
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
