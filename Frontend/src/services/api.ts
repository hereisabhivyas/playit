import type {
  Song,
  Playlist,
  Artist,
  AuthResponse,
  LoginPayload,
  SignupPayload,
  UpdateProfilePayload,
  UserProfile,
} from '../types/index';

const API_BASE_URL = 'http://localhost:5000/api';

const getErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    if (data?.message) return data.message;
  } catch {
    // Ignore parse errors and use fallback message
  }
  return 'Request failed';
};

const authHeaders = (token: string): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

const normalizeSong = (song: Song): Song => ({
  ...song,
  id: song.id || (song as Song & { _id?: string })._id || '',
});

// Songs API
export const fetchSongs = async (): Promise<Song[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/songs`);
    if (!response.ok) throw new Error('Failed to fetch songs');
    const songs = (await response.json()) as Song[];
    return songs.map(normalizeSong);
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
};

export const fetchSongById = async (id: string): Promise<Song | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/songs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch song');
    return normalizeSong((await response.json()) as Song);
  } catch (error) {
    console.error('Error fetching song:', error);
    return null;
  }
};

export const createSong = async (song: Song): Promise<Song | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(song),
    });
    if (!response.ok) throw new Error('Failed to create song');
    return normalizeSong((await response.json()) as Song);
  } catch (error) {
    console.error('Error creating song:', error);
    return null;
  }
};

export const uploadUserSong = async (
  title: string,
  artist: string,
  genre: string,
  duration: string,
  audioFile: File,
): Promise<Song | null> => {
  try {
    const token = localStorage.getItem('playit_auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('genre', genre);
    formData.append('duration', duration ? String(parseInt(duration, 10) || 0) : '0');
    formData.append('audio', audioFile);

    const response = await fetch(`${API_BASE_URL}/songs/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to upload song');
    }

    return normalizeSong((await response.json()) as Song);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error uploading song';
    console.error(message, error);
    throw error;
  }
};

export const fetchUserSongs = async (): Promise<Song[]> => {
  try {
    const token = localStorage.getItem('playit_auth_token');
    if (!token) {
      return [];
    }

    const response = await fetch(`${API_BASE_URL}/songs`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch songs');

    const allSongs = ((await response.json()) as Song[]).map(normalizeSong);
    return allSongs.filter((song: Song) => song.isUserUploaded);
  } catch (error) {
    console.error('Error fetching user songs:', error);
    return [];
  }
};

// Playlists API
export const fetchPlaylists = async (): Promise<Playlist[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists`);
    if (!response.ok) throw new Error('Failed to fetch playlists');
    return await response.json();
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return [];
  }
};

export const fetchPlaylistById = async (id: string): Promise<Playlist | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}`);
    if (!response.ok) throw new Error('Failed to fetch playlist');
    return await response.json();
  } catch (error) {
    console.error('Error fetching playlist:', error);
    return null;
  }
};

export const createPlaylist = async (playlist: Playlist): Promise<Playlist | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(playlist),
    });
    if (!response.ok) throw new Error('Failed to create playlist');
    return await response.json();
  } catch (error) {
    console.error('Error creating playlist:', error);
    return null;
  }
};

// Artists API
export const fetchArtists = async (): Promise<Artist[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/artists`);
    if (!response.ok) throw new Error('Failed to fetch artists');
    return await response.json();
  } catch (error) {
    console.error('Error fetching artists:', error);
    return [];
  }
};

export const fetchArtistById = async (id: string): Promise<Artist | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/artists/${id}`);
    if (!response.ok) throw new Error('Failed to fetch artist');
    return await response.json();
  } catch (error) {
    console.error('Error fetching artist:', error);
    return null;
  }
};

export const createArtist = async (artist: Artist): Promise<Artist | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/artists`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(artist),
    });
    if (!response.ok) throw new Error('Failed to create artist');
    return await response.json();
  } catch (error) {
    console.error('Error creating artist:', error);
    return null;
  }
};

// Auth API
export const signupUser = async (payload: SignupPayload): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const loginUser = async (payload: LoginPayload): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const fetchMyProfile = async (token: string): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/profile/me`, {
    headers: authHeaders(token),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};

export const updateMyProfile = async (
  token: string,
  payload: UpdateProfilePayload,
): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/profile/me`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json();
};
