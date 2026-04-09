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
const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
const DEFAULT_MEDIA_PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180"><rect width="180" height="180" fill="%231c1c1c"/><circle cx="90" cy="90" r="54" fill="%232a2a2a"/><path d="M102 54v54.8a14 14 0 1 1-8-12.6V63.6l38-9.6v44.8a14 14 0 1 1-8-12.6V46l-22 8z" fill="%23bbbbbb"/></svg>';

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

const normalizeMediaUrl = (value?: string): string => {
  if (!value) return DEFAULT_MEDIA_PLACEHOLDER;
  const trimmed = value.trim();

  if (!trimmed || trimmed.includes('via.placeholder.com')) {
    return DEFAULT_MEDIA_PLACEHOLDER;
  }

  if (/^(https?:|data:|blob:)/i.test(trimmed)) {
    return trimmed;
  }

  if (trimmed.startsWith('/')) {
    return `${API_ORIGIN}${trimmed}`;
  }

  return `${API_ORIGIN}/${trimmed}`;
};

const normalizeSong = (song: Song): Song => ({
  ...song,
  id: song.id || (song as Song & { _id?: string })._id || '',
  cover: normalizeMediaUrl(song.cover),
  streamUrl: song.streamUrl ? normalizeMediaUrl(song.streamUrl) : undefined,
});

const normalizePlaylist = (playlist: Playlist): Playlist => ({
  ...playlist,
  id: playlist.id || (playlist as Playlist & { _id?: string })._id || '',
  cover: normalizeMediaUrl(playlist.cover),
  songs: playlist.songs?.map(normalizeSong) || [],
});

const normalizeArtist = (artist: Artist): Artist => ({
  ...artist,
  image: normalizeMediaUrl(artist.image),
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
  coverFile?: File | null,
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
    if (coverFile) {
      formData.append('cover', coverFile);
    }

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

    const response = await fetch(`${API_BASE_URL}/songs/mine`, {
      headers: authHeaders(token),
    });
    if (!response.ok) throw new Error('Failed to fetch songs');

    return ((await response.json()) as Song[]).map(normalizeSong);
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
    const playlists = (await response.json()) as Playlist[];
    return playlists.map(normalizePlaylist);
  } catch (error) {
    console.error('Error fetching playlists:', error);
    return [];
  }
};

export const fetchPlaylistById = async (id: string): Promise<Playlist | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/playlists/${id}`);
    if (!response.ok) throw new Error('Failed to fetch playlist');
    return normalizePlaylist((await response.json()) as Playlist);
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
    return normalizePlaylist((await response.json()) as Playlist);
  } catch (error) {
    console.error('Error creating playlist:', error);
    return null;
  }
};

export interface PlaylistPayload {
  name: string;
  description: string;
  cover: string;
  songs: string[];
}

const toPlaylistFormData = (payload: PlaylistPayload, coverFile?: File | null): FormData => {
  const formData = new FormData();
  formData.append('name', payload.name);
  formData.append('description', payload.description);
  formData.append('songs', JSON.stringify(payload.songs));

  if (payload.cover) {
    formData.append('cover', payload.cover);
  }

  if (coverFile) {
    formData.append('cover', coverFile);
  }

  return formData;
};

export const createPlaylistByPayload = async (
  payload: PlaylistPayload,
  coverFile?: File | null,
): Promise<Playlist> => {
  const response = await fetch(`${API_BASE_URL}/playlists`, {
    method: 'POST',
    body: toPlaylistFormData(payload, coverFile),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return normalizePlaylist((await response.json()) as Playlist);
};

export const updatePlaylistById = async (
  playlistId: string,
  payload: PlaylistPayload,
  coverFile?: File | null,
): Promise<Playlist> => {
  const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
    method: 'PUT',
    body: toPlaylistFormData(payload, coverFile),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return normalizePlaylist((await response.json()) as Playlist);
};

export const deletePlaylistById = async (playlistId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/playlists/${playlistId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }
};

// Artists API
export const fetchArtists = async (): Promise<Artist[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/artists`);
    if (!response.ok) throw new Error('Failed to fetch artists');
    const artists = (await response.json()) as Artist[];
    return artists.map(normalizeArtist);
  } catch (error) {
    console.error('Error fetching artists:', error);
    return [];
  }
};

export const fetchArtistById = async (id: string): Promise<Artist | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/artists/${id}`);
    if (!response.ok) throw new Error('Failed to fetch artist');
    return normalizeArtist((await response.json()) as Artist);
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
    return normalizeArtist((await response.json()) as Artist);
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
