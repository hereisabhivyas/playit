import { useEffect, useState } from 'react';
import './styles/theme.css';
import './styles/app.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import MainContent from './components/MainContent';
import Player from './components/Player';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import { fetchMyProfile, fetchPlaylistById, fetchSongById, updateMyProfile } from './services/api';
import type { Playlist, Song, UpdateProfilePayload, UserProfile } from './types/index';

const AUTH_TOKEN_KEY = 'playit_auth_token';
const AUTH_USER_KEY = 'playit_user';

const getStoredUser = (): UserProfile | null => {
  const rawUser = localStorage.getItem(AUTH_USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser) as UserProfile;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

function App() {
  type AppView = 'home' | 'search' | 'library' | 'profile';
  type SidebarNav = 'home' | 'search' | 'library';
  type HistoryItem = {
    key: string;
    id: string;
    name: string;
    image: string;
    type: 'song' | 'playlist';
    song?: Song;
    playlist?: Playlist;
  };

  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [authToken, setAuthToken] = useState<string | null>(() => localStorage.getItem(AUTH_TOKEN_KEY));
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getStoredUser());
  const [authLoading, setAuthLoading] = useState(Boolean(localStorage.getItem(AUTH_TOKEN_KEY)));
  const [activeView, setActiveView] = useState<AppView>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [playHistory, setPlayHistory] = useState<HistoryItem[]>([]);
  const [viewState, setViewState] = useState<{ history: AppView[]; index: number }>({
    history: ['home'],
    index: 0,
  });

  const getSongKey = (song: Song) => String(song.id || song._id || song.title);
  const isPlayableSong = (value: unknown): value is Song => {
    if (!value || typeof value !== 'object') return false;
    const song = value as Partial<Song>;
    return Boolean(song.id || song._id || song.title);
  };

  const extractSongId = (value: unknown): string | null => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      const maybeSong = value as Partial<Song>;
      if (maybeSong.id) return String(maybeSong.id);
      if (maybeSong._id) return String(maybeSong._id);
    }
    return null;
  };

  const navigateToView = (view: AppView) => {
    const base = viewState.history.slice(0, viewState.index + 1);
    if (base[base.length - 1] !== view) {
      const nextHistory = [...base, view];
      setViewState({
        history: nextHistory,
        index: nextHistory.length - 1,
      });
    }
    setActiveView(view);
  };

  useEffect(() => {
    const syncProfile = async () => {
      if (!authToken) {
        setCurrentUser(null);
        setAuthLoading(false);
        return;
      }

      setAuthLoading(true);
      try {
        const profile = await fetchMyProfile(authToken);
        setCurrentUser(profile);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(profile));
      } catch {
        localStorage.removeItem(AUTH_TOKEN_KEY);
        localStorage.removeItem(AUTH_USER_KEY);
        setAuthToken(null);
        setCurrentUser(null);
      } finally {
        setAuthLoading(false);
      }
    };

    syncProfile();
  }, [authToken]);

  const handleSongSelect = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    const selectedSongKey = getSongKey(song);
    const existingIndex = queue.findIndex((queuedSong) => getSongKey(queuedSong) === selectedSongKey);

    if (existingIndex >= 0) {
      setCurrentIndex(existingIndex);
    } else {
      const nextQueue = [...queue, song];
      setQueue(nextQueue);
      setCurrentIndex(nextQueue.length - 1);
    }

    const songId = song.id || (song as Song & { _id?: string })._id || song.title;
    const historyItem: HistoryItem = {
      key: `song-${songId}`,
      id: String(songId),
      name: song.title,
      image: song.cover,
      type: 'song',
      song,
    };

    setPlayHistory((previous) => [historyItem, ...previous.filter((item) => item.key !== historyItem.key)].slice(0, 5));
  };

  const handlePlaylistSelect = async (playlist: Playlist) => {
    const playlistId = playlist.id || (playlist as Playlist & { _id?: string })._id || playlist.name;
    const historyItem: HistoryItem = {
      key: `playlist-${playlistId}`,
      id: String(playlistId),
      name: playlist.name,
      image: playlist.cover,
      type: 'playlist',
      playlist,
    };

    let playlistSongs = (playlist.songs || []).filter(isPlayableSong);
    if (playlistSongs.length === 0 && playlistId) {
      const freshPlaylist = await fetchPlaylistById(String(playlistId));
      if (freshPlaylist) {
        playlistSongs = (freshPlaylist.songs || []).filter(isPlayableSong);

        if (playlistSongs.length === 0) {
          const songIds = (freshPlaylist.songs || [])
            .map((item) => extractSongId(item))
            .filter((id): id is string => Boolean(id));
          if (songIds.length > 0) {
            const fetchedSongs = await Promise.all(songIds.map((id) => fetchSongById(id)));
            playlistSongs = fetchedSongs.filter((song): song is Song => Boolean(song));
          }
        }
      }
    }

    if (playlistSongs.length > 0) {
      setQueue(playlistSongs);
      setCurrentIndex(0);
      setCurrentSong(playlistSongs[0]);
      setIsPlaying(true);
    }

    setPlayHistory((previous) => [historyItem, ...previous.filter((item) => item.key !== historyItem.key)].slice(0, 5));
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (queue.length === 0) return;

    const activeSongKey = currentSong ? getSongKey(currentSong) : null;
    const activeIndex = activeSongKey
      ? queue.findIndex((song) => getSongKey(song) === activeSongKey)
      : currentIndex;
    const safeIndex = activeIndex >= 0 ? activeIndex : currentIndex;
    const nextIndex = (safeIndex + 1) % queue.length;

    setCurrentIndex(nextIndex);
    setCurrentSong(queue[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrevious = () => {
    if (queue.length === 0) return;

    const activeSongKey = currentSong ? getSongKey(currentSong) : null;
    const activeIndex = activeSongKey
      ? queue.findIndex((song) => getSongKey(song) === activeSongKey)
      : currentIndex;
    const safeIndex = activeIndex >= 0 ? activeIndex : currentIndex;
    const prevIndex = (safeIndex - 1 + queue.length) % queue.length;

    setCurrentIndex(prevIndex);
    setCurrentSong(queue[prevIndex]);
    setIsPlaying(true);
  };

  const handleAuthSuccess = (token: string, user: UserProfile) => {
    setAuthToken(token);
    setCurrentUser(user);
    navigateToView('home');
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  };

  const handleLogout = () => {
    setAuthToken(null);
    setCurrentUser(null);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  const handleProfileSave = async (payload: UpdateProfilePayload) => {
    if (!authToken) {
      throw new Error('Please login again');
    }

    const updatedProfile = await updateMyProfile(authToken, payload);
    setCurrentUser(updatedProfile);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updatedProfile));
  };

  const handleSidebarNavChange = (nextView: SidebarNav) => {
    navigateToView(nextView);
  };

  const handleSearchFromHeader = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      navigateToView('search');
    }
  };

  const handleNavigateBack = () => {
    if (viewState.index <= 0) return;
    const nextIndex = viewState.index - 1;
    setViewState({
      ...viewState,
      index: nextIndex,
    });
    setActiveView(viewState.history[nextIndex]);
  };

  const handleNavigateForward = () => {
    if (viewState.index >= viewState.history.length - 1) return;
    const nextIndex = viewState.index + 1;
    setViewState({
      ...viewState,
      index: nextIndex,
    });
    setActiveView(viewState.history[nextIndex]);
  };

  const handleHistoryItemClick = (historyKey: string) => {
    const item = playHistory.find((entry) => entry.key === historyKey);
    if (!item) return;

    if (item.type === 'song' && item.song) {
      handleSongSelect(item.song);
      navigateToView('home');
      return;
    }

    if (item.type === 'playlist' && item.playlist) {
      void handlePlaylistSelect(item.playlist);
    }
  };

  if (!authToken) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (authLoading || !currentUser) {
    return (
      <div className="app-loading-screen">
        <p>Loading your account...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <aside className="app-sidebar">
        <Sidebar
          activeNav={activeView === 'profile' ? 'home' : (activeView as SidebarNav)}
          onNavChange={handleSidebarNavChange}
          historyItems={playHistory.map((item) => ({
            key: item.key,
            id: item.id,
            name: item.name,
            image: item.image,
            type: item.type,
          }))}
          onHistoryItemClick={handleHistoryItemClick}
          userName={currentUser.name}
          username={currentUser.username}
        />
      </aside>
      <main className="app-main">
        <header className="app-header">
          <Header
            onSearch={handleSearchFromHeader}
            onHomeClick={() => navigateToView('home')}
            onProfileClick={() => navigateToView('profile')}
            onNavigateBack={handleNavigateBack}
            onNavigateForward={handleNavigateForward}
            onLogout={handleLogout}
          />
        </header>
        <div className="app-main-content">
          {activeView === 'home' && (
            <MainContent onSongSelect={handleSongSelect} onPlaylistSelect={handlePlaylistSelect} />
          )}

          {activeView === 'search' && (
            <SearchPage
              initialQuery={searchQuery}
              onQueryChange={setSearchQuery}
              onSongSelect={handleSongSelect}
              onPlaylistSelect={handlePlaylistSelect}
            />
          )}

          {activeView === 'library' && (
            <section className="library-view">
              <div className="library-view-header">
                <h2>Your Library</h2>
                <p>Recent songs and playlists from your listening history.</p>
              </div>
              <div className="library-grid">
                {playHistory.length === 0 ? (
                  <div className="library-empty">No history yet. Play a song or open a playlist to build your library cards.</div>
                ) : (
                  playHistory.map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      className="library-card"
                      onClick={() => handleHistoryItemClick(item.key)}
                    >
                      <img src={item.image} alt={item.name} />
                      <div className="library-card-name">{item.name}</div>
                      <div className="library-card-type">{item.type}</div>
                    </button>
                  ))
                )}
              </div>
            </section>
          )}

          {activeView === 'profile' && (
            <ProfilePage user={currentUser} onSave={handleProfileSave} />
          )}
        </div>
      </main>
      <footer className="app-player">
        <Player
          currentSong={currentSong}
          isPlaying={isPlaying}
          onPlayPause={handlePlayPause}
          onNext={handleNext}
          onPrevious={handlePrevious}
        />
      </footer>
    </div>
  );
}

export default App;

