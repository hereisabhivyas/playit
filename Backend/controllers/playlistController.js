import Playlist from '../models/Playlist.js';

const parseSongs = (songsInput) => {
  if (songsInput === undefined || songsInput === null) return undefined;
  if (Array.isArray(songsInput)) return songsInput;

  if (typeof songsInput === 'string') {
    const trimmed = songsInput.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return trimmed
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
    }
  }

  return [];
};

export const getPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find().populate('songs');
    res.json(playlists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('songs');
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    res.json(playlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createPlaylist = async (req, res) => {
  const songs = parseSongs(req.body.songs);
  const coverPath = req.file ? `/uploads/images/${req.file.filename}` : req.body.cover;

  const playlist = new Playlist({
    name: req.body.name,
    description: req.body.description,
    cover: coverPath,
    songs: songs || [],
  });

  try {
    const newPlaylist = await playlist.save();
    res.status(201).json(newPlaylist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updatePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }

    const songs = parseSongs(req.body.songs);
    const coverPath = req.file ? `/uploads/images/${req.file.filename}` : req.body.cover;

    if (req.body.name) playlist.name = req.body.name;
    if (req.body.description) playlist.description = req.body.description;
    if (coverPath) playlist.cover = coverPath;
    if (songs !== undefined) playlist.songs = songs;
    if (req.body.isLiked !== undefined) playlist.isLiked = req.body.isLiked;

    const updatedPlaylist = await playlist.save();
    res.json(updatedPlaylist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    await playlist.deleteOne();
    res.json({ message: 'Playlist deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
