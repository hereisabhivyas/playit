import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const getJwtSecret = () => process.env.JWT_SECRET || 'change-me-in-production';

const normalizeGenres = (genres) => {
  if (!genres) return [];
  if (Array.isArray(genres)) {
    return genres
      .map((genre) => String(genre).trim())
      .filter(Boolean);
  }
  return String(genres)
    .split(',')
    .map((genre) => genre.trim())
    .filter(Boolean);
};

const createToken = (user) =>
  jwt.sign({ userId: user._id.toString(), username: user.username }, getJwtSecret(), {
    expiresIn: '7d',
  });

export const signup = async (req, res) => {
  try {
    const {
      username,
      password,
      name = '',
      email = '',
      region = '',
      interestedGenres = [],
      bio = '',
    } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const normalizedUsername = String(username).trim().toLowerCase();
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({
      username: normalizedUsername,
      password: passwordHash,
      name,
      email,
      region,
      interestedGenres: normalizeGenres(interestedGenres),
      bio,
    });

    const token = createToken(user);
    return res.status(201).json({ token, user });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    const normalizedUsername = String(username).trim().toLowerCase();
    const user = await User.findOne({ username: normalizedUsername }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = createToken(user);
    const safeUser = user.toObject();
    delete safeUser.password;

    return res.json({ token, user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
