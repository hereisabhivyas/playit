import Artist from '../models/Artist.js';

export const getArtists = async (req, res) => {
  try {
    const artists = await Artist.find();
    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    res.json(artist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createArtist = async (req, res) => {
  const artist = new Artist({
    name: req.body.name,
    image: req.body.image,
    followers: req.body.followers || 0,
  });

  try {
    const newArtist = await artist.save();
    res.status(201).json(newArtist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }

    if (req.body.name) artist.name = req.body.name;
    if (req.body.image) artist.image = req.body.image;
    if (req.body.followers !== undefined) artist.followers = req.body.followers;

    const updatedArtist = await artist.save();
    res.json(updatedArtist);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteArtist = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    await artist.deleteOne();
    res.json({ message: 'Artist deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
