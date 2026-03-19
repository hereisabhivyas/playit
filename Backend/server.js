import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import songRoutes from './routes/songs.js';
import playlistRoutes from './routes/playlists.js';
import artistRoutes from './routes/artists.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/playit';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.set('bufferCommands', false);

const connectToDatabase = async () => {
  try {
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
  }
};

mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected');
});

connectToDatabase();

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    status: 'OK',
    message: 'Server is running',
    database: dbConnected ? 'connected' : 'disconnected',
  });
});

const requireDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database unavailable. Start MongoDB or set MONGODB_URI.',
    });
  }
  return next();
};

// Routes
app.use('/api/songs', requireDbConnection, songRoutes);
app.use('/api/playlists', requireDbConnection, playlistRoutes);
app.use('/api/artists', requireDbConnection, artistRoutes);
app.use('/api/auth', requireDbConnection, authRoutes);
app.use('/api/profile', requireDbConnection, profileRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
