import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import type { UpdateProfilePayload, UserProfile, Song, Playlist } from '../types';
import {
  uploadUserSong,
  fetchUserSongs,
  fetchPlaylists,
  createPlaylistByPayload,
  updatePlaylistById,
  deletePlaylistById,
} from '../services/api';
import { getFallbackImage } from '../utils/imageFallback';
import '../styles/profile-page.css';

interface ProfilePageProps {
  user: UserProfile;
  onSave: (payload: UpdateProfilePayload) => Promise<void>;
}

const ProfilePage = ({ user, onSave }: ProfilePageProps) => {
  const MY_PLAYLISTS_STORAGE_KEY = `playit_my_playlists_${user._id}`;
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
  const [musicCoverFile, setMusicCoverFile] = useState<File | null>(null);
  const [musicFile, setMusicFile] = useState<File | null>(null);
  const [addMusicMessage, setAddMusicMessage] = useState('');
  const [addMusicError, setAddMusicError] = useState('');
  const [userSongs, setUserSongs] = useState<Song[]>([]);
  const [loadingUserSongs, setLoadingUserSongs] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [playlistDescription, setPlaylistDescription] = useState('');
  const [playlistCoverFile, setPlaylistCoverFile] = useState<File | null>(null);
  const [playlistCoverPreview, setPlaylistCoverPreview] = useState('');
  const [selectedSongIds, setSelectedSongIds] = useState<string[]>([]);
  const [myPlaylists, setMyPlaylists] = useState<Playlist[]>([]);
  const [loadingMyPlaylists, setLoadingMyPlaylists] = useState(false);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [playlistMessage, setPlaylistMessage] = useState('');
  const [playlistError, setPlaylistError] = useState('');
  const [editingPlaylistId, setEditingPlaylistId] = useState<string | null>(null);

  const getSongId = (song: Song) => String(song.id || song._id || song.title);
  const getPlaylistId = (playlist: Playlist) => String(playlist.id || playlist._id || '');

  const readMyPlaylistIds = (): string[] => {
    const raw = localStorage.getItem(MY_PLAYLISTS_STORAGE_KEY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as string[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };

  const saveMyPlaylistIds = (ids: string[]) => {
    localStorage.setItem(MY_PLAYLISTS_STORAGE_KEY, JSON.stringify(Array.from(new Set(ids))));
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
          return;
        }
        reject(new Error('Unable to read file'));
      };
      reader.onerror = () => reject(new Error('Unable to read file'));
      reader.readAsDataURL(file);
    });

  const resetPlaylistForm = () => {
    setPlaylistName('');
    setPlaylistDescription('');
    setPlaylistCoverFile(null);
    setPlaylistCoverPreview('');
    setSelectedSongIds([]);
    setEditingPlaylistId(null);
  };

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

  useEffect(() => {
    const loadMyPlaylists = async () => {
      setLoadingMyPlaylists(true);
      const myPlaylistIds = readMyPlaylistIds();
      if (!myPlaylistIds.length) {
        setMyPlaylists([]);
        setLoadingMyPlaylists(false);
        return;
      }

      const allPlaylists = await fetchPlaylists();
      const ownPlaylists = allPlaylists.filter((playlist) =>
        myPlaylistIds.includes(getPlaylistId(playlist)),
      );
      setMyPlaylists(ownPlaylists);
      setLoadingMyPlaylists(false);
    };

    loadMyPlaylists();
  }, [MY_PLAYLISTS_STORAGE_KEY]);

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
      await uploadUserSong(
        musicTitle,
        musicArtist,
        musicGenre,
        musicDuration,
        musicFile,
        musicCoverFile,
      );
      setAddMusicMessage('Music uploaded successfully!');
      setMusicTitle('');
      setMusicArtist('');
      setMusicGenre('');
      setMusicDuration('');
      setMusicCoverFile(null);
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

  const toggleSongSelection = (songId: string) => {
    setSelectedSongIds((previous) => {
      if (previous.includes(songId)) {
        return previous.filter((id) => id !== songId);
      }
      return [...previous, songId];
    });
  };

  const handlePlaylistCoverChange = async (file: File | null) => {
    setPlaylistCoverFile(file);
    if (!file) {
      setPlaylistCoverPreview('');
      return;
    }

    try {
      const preview = await fileToDataUrl(file);
      setPlaylistCoverPreview(preview);
    } catch {
      setPlaylistError('Unable to read selected cover image.');
    }
  };

  const handlePlaylistSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPlaylistMessage('');
    setPlaylistError('');

    if (!playlistName.trim()) {
      setPlaylistError('Playlist name is required.');
      return;
    }

    setPlaylistLoading(true);

    try {
      const editingPlaylist = editingPlaylistId
        ? myPlaylists.find((playlist) => getPlaylistId(playlist) === editingPlaylistId)
        : null;

      const coverValue = editingPlaylist?.cover || getFallbackImage('Playlist', 200);

      const payload = {
        name: playlistName.trim(),
        description: playlistDescription.trim() || 'My custom playlist',
        cover: coverValue,
        songs: selectedSongIds,
      };

      if (editingPlaylistId) {
        const updated = await updatePlaylistById(editingPlaylistId, payload, playlistCoverFile);
        setMyPlaylists((previous) =>
          previous.map((playlist) =>
            getPlaylistId(playlist) === editingPlaylistId ? updated : playlist,
          ),
        );
        setPlaylistMessage('Playlist updated successfully.');
      } else {
        const created = await createPlaylistByPayload(payload, playlistCoverFile);
        const createdId = getPlaylistId(created);
        setMyPlaylists((previous) => [created, ...previous]);
        saveMyPlaylistIds([...readMyPlaylistIds(), createdId]);
        setPlaylistMessage('Playlist created successfully.');
      }

      resetPlaylistForm();
    } catch (error) {
      setPlaylistError(error instanceof Error ? error.message : 'Unable to save playlist.');
    } finally {
      setPlaylistLoading(false);
    }
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylistId(getPlaylistId(playlist));
    setPlaylistName(playlist.name);
    setPlaylistDescription(playlist.description || '');
    setPlaylistCoverFile(null);
    setPlaylistCoverPreview(playlist.cover);
    setSelectedSongIds(playlist.songs.map((song) => getSongId(song)));
    setPlaylistMessage('');
    setPlaylistError('');
  };

  const handleDeletePlaylist = async (playlistId: string) => {
    const shouldDelete = window.confirm('Delete this playlist? This action cannot be undone.');
    if (!shouldDelete) return;

    setPlaylistMessage('');
    setPlaylistError('');

    try {
      await deletePlaylistById(playlistId);
      setMyPlaylists((previous) =>
        previous.filter((playlist) => getPlaylistId(playlist) !== playlistId),
      );
      saveMyPlaylistIds(readMyPlaylistIds().filter((id) => id !== playlistId));
      if (editingPlaylistId === playlistId) {
        resetPlaylistForm();
      }
      setPlaylistMessage('Playlist deleted successfully.');
    } catch (error) {
      setPlaylistError(error instanceof Error ? error.message : 'Unable to delete playlist.');
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
              onChange={(event) => setMusicCoverFile(event.currentTarget.files?.[0] || null)}
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

      <div className="my-playlist-card">
        <h2>Make My Own Playlist</h2>
        <p>Create custom playlists, upload a cover, and add your songs.</p>

        <form onSubmit={handlePlaylistSubmit} className="playlist-builder-form">
          <label>
            Playlist Name *
            <input
              value={playlistName}
              onChange={(event) => setPlaylistName(event.target.value)}
              placeholder="Road Trip Vibes"
              required
            />
          </label>

          <label>
            Description
            <input
              value={playlistDescription}
              onChange={(event) => setPlaylistDescription(event.target.value)}
              placeholder="Short description"
            />
          </label>

          <label>
            Cover Image
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                void handlePlaylistCoverChange(event.currentTarget.files?.[0] || null)
              }
            />
          </label>

          <div className="playlist-cover-preview-wrap">
            <span>Cover Preview</span>
            <img
              src={playlistCoverPreview || getFallbackImage('Playlist', 120)}
              alt="playlist cover preview"
              className="playlist-cover-preview"
            />
          </div>

          <div className="playlist-song-selector">
            <div className="playlist-song-selector-header">
              <strong>Add Songs</strong>
              <span>{selectedSongIds.length} selected</span>
            </div>
            {loadingUserSongs ? (
              <p className="playlist-help-text">Loading your songs...</p>
            ) : userSongs.length === 0 ? (
              <p className="playlist-help-text">Upload songs first from the Add My Music section.</p>
            ) : (
              <div className="playlist-song-list">
                {userSongs.map((song) => {
                  const songId = getSongId(song);
                  return (
                    <label key={songId} className="playlist-song-item">
                      <input
                        type="checkbox"
                        checked={selectedSongIds.includes(songId)}
                        onChange={() => toggleSongSelection(songId)}
                      />
                      <span>{song.title} - {song.artist}</span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {playlistMessage && <p className="playlist-success">{playlistMessage}</p>}
          {playlistError && <p className="playlist-error">{playlistError}</p>}

          <div className="playlist-actions">
            <button type="submit" className="playlist-submit" disabled={playlistLoading}>
              {playlistLoading
                ? 'Saving...'
                : editingPlaylistId
                  ? 'Update Playlist'
                  : 'Create Playlist'}
            </button>
            {editingPlaylistId && (
              <button
                type="button"
                className="playlist-cancel"
                onClick={resetPlaylistForm}
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        <div className="my-playlist-list">
          <h3>My Playlists</h3>
          {loadingMyPlaylists ? (
            <p className="playlist-help-text">Loading playlists...</p>
          ) : myPlaylists.length === 0 ? (
            <p className="playlist-help-text">No playlist yet. Create your first one above.</p>
          ) : (
            <div className="playlist-grid">
              {myPlaylists.map((playlist) => {
                const playlistId = getPlaylistId(playlist);
                return (
                  <div className="playlist-item" key={playlistId}>
                    <img src={playlist.cover} alt={playlist.name} className="playlist-item-cover" />
                    <div className="playlist-item-body">
                      <h4>{playlist.name}</h4>
                      <p>{playlist.description}</p>
                      <small>{playlist.songs.length} song(s)</small>
                    </div>
                    <div className="playlist-item-actions">
                      <button type="button" onClick={() => handleEditPlaylist(playlist)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => handleDeletePlaylist(playlistId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
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
                      e.currentTarget.src = getFallbackImage('Music', 120);
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
