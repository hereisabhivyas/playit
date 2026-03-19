import Playlist from '../models/Playlist.js';

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
  const playlist = new Playlist({
    name: req.body.name,
    description: req.body.description,
    cover: req.body.cover,
    songs: req.body.songs || [],
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

    if (req.body.name) playlist.name = req.body.name;
    if (req.body.description) playlist.description = req.body.description;
    if (req.body.cover) playlist.cover = req.body.cover;
    if (req.body.songs) playlist.songs = req.body.songs;
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
