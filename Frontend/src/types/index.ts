export interface Song {
  id: string;
  _id?: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  cover: string;
  genre: string;
  streamUrl?: string;
  uploadedBy?: string;
  isUserUploaded?: boolean;
  createdAt?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  cover: string;
  createdAt: Date;
  isLiked?: boolean;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  followers: number;
}

export interface PlayerState {
  isPlaying: boolean;
  currentSong: Song | null;
  currentTime: number;
  duration: number;
  volume: number;
  queue: Song[];
  currentIndex: number;
  isRepeat: 'off' | 'all' | 'one';
  isShuffle: boolean;
}

export interface UserProfile {
  _id: string;
  username: string;
  name: string;
  email: string;
  region: string;
  interestedGenres: string[];
  bio: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface SignupPayload {
  username: string;
  password: string;
  name?: string;
  email?: string;
  region?: string;
  interestedGenres?: string[];
  bio?: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface UpdateProfilePayload {
  username?: string;
  name?: string;
  email?: string;
  region?: string;
  interestedGenres?: string[];
  bio?: string;
  password?: string;
}
