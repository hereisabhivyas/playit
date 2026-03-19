import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: true,
  },
  album: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  cover: {
    type: String,
    required: true,
  },
  genre: {
    type: String,
    required: true,
  },
  audioFileName: {
    type: String,
    default: null,
  },
  audioMimeType: {
    type: String,
    default: null,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  isUserUploaded: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Song', songSchema);
