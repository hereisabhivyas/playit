import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { UpdateProfilePayload, UserProfile, Song } from '../types';
import { uploadUserSong, fetchUserSongs } from '../services/api';
import '../styles/profile-page.css';

interface ProfilePageProps {
  user: UserProfile;
  onSave: (payload: UpdateProfilePayload) => Promise<void>;
}

const ProfilePage = ({ user, onSave }: ProfilePageProps) => {
  const [username, setUsername] = useState(user.username);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [region, setRegion] = useState(user.region);
  const [interestedGenres, setInterestedGenres] = useState(user.interestedGenres.join(', '));
  const [bio, setBio] = useState(user.bio);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [musicTitle, setMusicTitle] = useState('');
  const [musicArtist, setMusicArtist] = useState('');
  const [musicGenre, setMusicGenre] = useState('');
  const [musicDuration, setMusicDuration] = useState('');
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [addMusicMessage, setAddMusicMessage] = useState('');
  const [addMusicError, setAddMusicError] = useState('');
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [loadingUserSongs, setLoadingUserSongs] = useState(false);

  useEffect(() => {
    setUsername(user.username);
    setName(user.name);
    setEmail(user.email);
    setRegion(user.region);
    setInterestedGenres(user.interestedGenres.join(', '));
    setBio(user.bio);
    setPassword('');
  }, [user]);

  useEffect(() => {
    const loadUserSongs = async () => {
      setLoadingUserSongs(true);
      const songs = await fetchUserSongs();
      setUserSongs(songs);
      setLoadingUserSongs(false);
    };
    loadUserSongs();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setSuccessMessage('');
    setErrorMessage('');

    const payload: UpdateProfilePayload = {
      username,
      name,
      email,
      region,
      bio,
      interestedGenres: interestedGenres
        .split(',')
        .map((genre) => genre.trim())
        .filter(Boolean),
    };

    if (password.trim()) {
      payload.password = password;
    }

    try {
      await onSave(payload);
      setPassword('');
      setSuccessMessage('Profile updated successfully.');
    } catch (requestError) {
      if (requestError instanceof Error) {
        setErrorMessage(requestError.message);
      } else {
        setErrorMessage('Unable to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddMusic = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAddMusicError('');
    setAddMusicMessage('');

    if (!musicTitle.trim() || !musicArtist.trim() || !musicGenre.trim()) {
      setAddMusicError('Please fill in all required fields.');
      return;
    }

    if (!musicFile) {
      setAddMusicError('Please select a music file.');
      return;
    }

    try {
      await uploadUserSong(musicTitle, musicArtist, musicGenre, musicDuration, musicFile);
      setAddMusicMessage('Music uploaded successfully!');
      setMusicTitle('');
      setMusicArtist('');
      setMusicGenre('');
      setMusicDuration('');
      setMusicFile(null);
      // Refresh the user songs list
      const updatedSongs = await fetchUserSongs();
      setUserSongs(updatedSongs);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to upload music. Please try again.';
      setAddMusicError(errorMessage);
    }
  };

  return (
    <section className="profile-page">
      <div className="profile-card">
        <h2>Your Profile</h2>
        <p>Update your personal information and listening preferences.</p>

        <form onSubmit={handleSubmit} className="profile-form">
          <label>
            Username
            <input
              value={username}
              minLength={3}
              required
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>

          <label>
            Name
            <input value={name} onChange={(event) => setName(event.target.value)} />
          </label>

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            Region
            <input value={region} onChange={(event) => setRegion(event.target.value)} />
          </label>

          <label>
            Interested Genres
            <input
              value={interestedGenres}
              onChange={(event) => setInterestedGenres(event.target.value)}
              placeholder="Pop, Rock, RnB"
            />
          </label>

          <label>
            Bio
            <textarea
              rows={4}
              value={bio}
              onChange={(event) => setBio(event.target.value)}
            />
          </label>

          <label>
            New Password
            <input
              type="password"
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Leave blank to keep current password"
            />
          </label>

          {successMessage && <p className="profile-success">{successMessage}</p>}
          {errorMessage && <p className="profile-error">{errorMessage}</p>}

          <button type="submit" className="profile-submit" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="add-music-card">
        <h2>Add My Music</h2>
        <p>Upload your own songs and share them on Playit.</p>

        <form onSubmit={handleAddMusic} className="add-music-form">
          <label>
            Song Title *
            <input
              value={musicTitle}
              onChange={(event) => setMusicTitle(event.target.value)}
              placeholder="Enter song title"
              required
            />
          </label>

          <label>
            Artist Name *
            <input
              value={musicArtist}
              onChange={(event) => setMusicArtist(event.target.value)}
              placeholder="Your name or artist name"
              required
            />
          </label>

          <label>
            Genre *
            <input
              value={musicGenre}
              onChange={(event) => setMusicGenre(event.target.value)}
              placeholder="Pop, Rock, Jazz..."
              required
            />
          </label>

          <label>
            Duration (seconds)
            <input
              type="number"
              value={musicDuration}
              onChange={(event) => setMusicDuration(event.target.value)}
              placeholder="e.g., 180"
              min="1"
            />
          </label>

          <label>
            Cover Image
            <input
              type="file"
              accept="image/*"
            />
          </label>

          <label>
            Music File *
            <input
              type="file"
              accept="audio/*"
              onChange={(event) => setMusicFile(event.currentTarget.files?.[0] || null)}
              required
            />
          </label>

          {addMusicMessage && <p className="add-music-success">{addMusicMessage}</p>}
          {addMusicError && <p className="add-music-error">{addMusicError}</p>}

          <button type="submit" className="add-music-submit">
            Upload Music
          </button>
        </form>
      </div>

      {userSongs.length > 0 && (
        <div className="my-music-card">
          <h2>My Uploaded Music</h2>
          {loadingUserSongs ? (
            <p>Loading your music...</p>
          ) : (
            <div className="uploaded-songs-grid">
              {userSongs.map((song) => (
                <div key={song.id} className="uploaded-song-item">
                  <img
                    src={song.cover}
                    alt={song.title}
                    className="song-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/120x120?text=Music';
                    }}
                  />
                  <div className="song-info">
                    <h4>{song.title}</h4>
                    <p className="song-artist">{song.artist}</p>
                    <p className="song-genre">{song.genre}</p>
                    {song.duration > 0 && (
                      <p className="song-duration">
                        {Math.floor(song.duration / 60)}:{String(song.duration % 60).padStart(2, '0')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProfilePage;
