import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const normalizeGenres = (genres) => {
  if (genres === undefined) return undefined;
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

export const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const {
      username,
      name,
      email,
      region,
      interestedGenres,
      bio,
      password,
    } = req.body;

    if (username !== undefined) {
      const normalizedUsername = String(username).trim().toLowerCase();
      if (normalizedUsername.length < 3) {
        return res.status(400).json({ message: 'Username must be at least 3 characters' });
      }

      if (normalizedUsername !== user.username) {
        const existing = await User.findOne({ username: normalizedUsername });
        if (existing) {
          return res.status(409).json({ message: 'Username already exists' });
        }
      }

      user.username = normalizedUsername;
    }

    if (name !== undefined) user.name = name;
    if (email !== undefined) user.email = email;
    if (region !== undefined) user.region = region;
    if (bio !== undefined) user.bio = bio;

    const normalizedGenres = normalizeGenres(interestedGenres);
    if (normalizedGenres !== undefined) {
      user.interestedGenres = normalizedGenres;
    }

    if (password !== undefined && String(password).trim() !== '') {
      if (String(password).length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }
      user.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await user.save();
    const safeUser = updatedUser.toObject();
    delete safeUser.password;

    return res.json(safeUser);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};
