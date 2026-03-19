import fs from 'fs';
import path from 'path';
import Song from '../models/Song.js';

const getAudioFilePath = (song) => path.resolve(process.cwd(), 'uploads', 'audio', song.audioFileName);

const withStreamUrl = (song, req) => {
  const payload = song.toObject ? song.toObject() : song;
  const id = payload._id?.toString?.() || payload.id;

  return {
    ...payload,
    id,
    streamUrl: id ? `${req.protocol}://${req.get('host')}/api/songs/${id}/stream` : null,
  };
};

export const getSongs = async (req, res) => {
  try {
    const songs = await Song.find().sort({ createdAt: -1 });
    res.json(songs.map((song) => withStreamUrl(song, req)));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }
    res.json(withStreamUrl(song, req));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const streamSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song || !song.audioFileName) {
      return res.status(404).json({ message: 'Audio stream not found for this song.' });
    }

    const audioPath = getAudioFilePath(song);

    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ message: 'Audio file is missing.' });
    }

    const stat = fs.statSync(audioPath);
    const fileSize = stat.size;
    const range = req.headers.range;
    const contentType = song.audioMimeType || 'audio/mpeg';

    if (range) {
      const [startPart, endPart] = range.replace(/bytes=/, '').split('-');
      const start = Number.parseInt(startPart, 10);
      const end = endPart ? Number.parseInt(endPart, 10) : fileSize - 1;

      if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= fileSize) {
        res.status(416).set('Content-Range', `bytes */${fileSize}`).end();
        return;
      }

      const chunkSize = end - start + 1;
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });

      const stream = fs.createReadStream(audioPath, { start, end });
      stream.pipe(res);
      return;
    }

    res.writeHead(200, {
      'Content-Length': fileSize,
      'Content-Type': contentType,
      'Accept-Ranges': 'bytes',
    });

    fs.createReadStream(audioPath).pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSong = async (req, res) => {
  const song = new Song({
    title: req.body.title,
    artist: req.body.artist,
    album: req.body.album,
    duration: req.body.duration,
    cover: req.body.cover,
    genre: req.body.genre,
    audioFileName: req.body.audioFileName || null,
    audioMimeType: req.body.audioMimeType || null,
  });

  try {
    const newSong = await song.save();
    res.status(201).json(withStreamUrl(newSong, req));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const uploadUserSong = async (req, res) => {
  try {
    const { title, artist, genre, duration } = req.body;
    const userId = req.user.id;

    if (!title?.trim() || !artist?.trim() || !genre?.trim()) {
      return res.status(400).json({ message: 'Title, artist, and genre are required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Audio file is required.' });
    }

    const song = new Song({
      title: title.trim(),
      artist: artist.trim(),
      album: title.trim(),
      duration: duration ? parseInt(duration, 10) : 0,
      cover: 'https://via.placeholder.com/180x180?text=User+Music',
      genre: genre.trim(),
      audioFileName: req.file.filename,
      audioMimeType: req.file.mimetype,
      uploadedBy: userId,
      isUserUploaded: true,
    });

    const newSong = await song.save();
    await newSong.populate('uploadedBy', 'username name');

    res.status(201).json(withStreamUrl(newSong, req));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    if (req.body.title) song.title = req.body.title;
    if (req.body.artist) song.artist = req.body.artist;
    if (req.body.album) song.album = req.body.album;
    if (req.body.duration) song.duration = req.body.duration;
    if (req.body.cover) song.cover = req.body.cover;
    if (req.body.genre) song.genre = req.body.genre;

    const updatedSong = await song.save();
    res.json(withStreamUrl(updatedSong, req));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    if (song.audioFileName) {
      const audioPath = getAudioFilePath(song);
      if (fs.existsSync(audioPath)) {
        fs.unlinkSync(audioPath);
      }
    }

    await song.deleteOne();
    res.json({ message: 'Song deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
