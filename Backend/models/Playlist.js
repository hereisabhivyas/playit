import mongoose from 'mongoose';

const playlistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  cover: {
    type: String,
    required: true,
  },
  songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Song',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isLiked: {
    type: Boolean,
    default: false,
  },
});

export default mongoose.model('Playlist', playlistSchema);
