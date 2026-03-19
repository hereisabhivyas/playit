import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { fetchArtists, fetchPlaylists, fetchSongs } from '../services/api';
import type { Artist, Playlist, Song } from '../types';
import '../styles/search-page.css';

interface SearchPageProps {
  initialQuery?: string;
  onQueryChange?: (value: string) => void;
  onSongSelect: (song: Song) => void;
  onPlaylistSelect: (playlist: Playlist) => void;
}

type SearchFilter = 'all' | 'songs' | 'playlists' | 'artists';

const SEARCH_HISTORY_KEY = 'playit_search_history';

const getEntityId = (item: { id?: string; _id?: string }, fallback: string) =>
  item.id || item._id || fallback;

const loadSearchHistory = (): string[] => {
  const raw = localStorage.getItem(SEARCH_HISTORY_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string') : [];
  } catch {
    return [];
  }
};

const SearchPage = ({
  initialQuery = '',
  onQueryChange,
  onSongSelect,
  onPlaylistSelect,
}: SearchPageProps) => {
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<SearchFilter>('all');
  const [songs, setSongs] = useState<Song[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<string[]>(() => loadSearchHistory());

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [songsData, playlistsData, artistsData] = await Promise.all([
          fetchSongs(),
          fetchPlaylists(),
          fetchArtists(),
        ]);
        setSongs(songsData);
        setPlaylists(playlistsData);
        setArtists(artistsData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const filteredSongs = useMemo(() => {
    if (!normalizedQuery) return songs;
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(normalizedQuery) ||
        song.artist.toLowerCase().includes(normalizedQuery) ||
        song.genre.toLowerCase().includes(normalizedQuery),
    );
  }, [songs, normalizedQuery]);

  const filteredPlaylists = useMemo(() => {
    if (!normalizedQuery) return playlists;
    return playlists.filter(
      (playlist) =>
        playlist.name.toLowerCase().includes(normalizedQuery) ||
        playlist.description.toLowerCase().includes(normalizedQuery),
    );
  }, [playlists, normalizedQuery]);

  const filteredArtists = useMemo(() => {
    if (!normalizedQuery) return artists;
    return artists.filter((artist) => artist.name.toLowerCase().includes(normalizedQuery));
  }, [artists, normalizedQuery]);

  const saveSearchToHistory = (value: string) => {
    const normalized = value.trim();
    if (!normalized) return;

    setHistory((previous) => {
      const deduped = previous.filter(
        (item) => item.toLowerCase() !== normalized.toLowerCase(),
      );
      const next = [normalized, ...deduped].slice(0, 8);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    onQueryChange?.(value);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveSearchToHistory(query);
  };

  const renderSongs = (items: Song[]) => (
    <div className="search-card-grid">
      {items.map((song) => (
        <button
          type="button"
          key={getEntityId(song as Song & { _id?: string }, song.title)}
          className="search-result-card"
          onClick={() => onSongSelect(song)}
        >
          <img
            src={song.cover}
            alt={song.title}
            onError={(event) => {
              event.currentTarget.src = 'https://via.placeholder.com/120x120?text=Song';
            }}
          />
          <h4>{song.title}</h4>
          <p>{song.artist}</p>
        </button>
      ))}
    </div>
  );

  const renderPlaylists = (items: Playlist[]) => (
    <div className="search-card-grid">
      {items.map((playlist) => (
        <button
          type="button"
          key={getEntityId(playlist as Playlist & { _id?: string }, playlist.name)}
          className="search-result-card"
          onClick={() => onPlaylistSelect(playlist)}
        >
          <img
            src={playlist.cover}
            alt={playlist.name}
            onError={(event) => {
              event.currentTarget.src = 'https://via.placeholder.com/120x120?text=Playlist';
            }}
          />
          <h4>{playlist.name}</h4>
          <p>{playlist.description}</p>
        </button>
      ))}
    </div>
  );

  const renderArtists = (items: Artist[]) => (
    <div className="search-card-grid">
      {items.map((artist) => (
        <div key={getEntityId(artist as Artist & { _id?: string }, artist.name)} className="search-result-card static-card">
          <img
            src={artist.image}
            alt={artist.name}
            onError={(event) => {
              event.currentTarget.src = 'https://via.placeholder.com/120x120?text=Artist';
            }}
          />
          <h4>{artist.name}</h4>
          <p>Artist</p>
        </div>
      ))}
    </div>
  );

  return (
    <section className="search-page">
      <div className="search-page-header">
        <h2>Search Music</h2>
        <p>Find songs, playlists, and artists. Your recent searches are saved below.</p>
      </div>

      <form className="search-form" onSubmit={handleSubmit}>
        <input
          value={query}
          onChange={(event) => handleInputChange(event.target.value)}
          placeholder="Search songs, artists, playlists..."
        />
        <button type="submit">Search</button>
      </form>

      <div className="search-filter-row">
        {(['all', 'songs', 'playlists', 'artists'] as SearchFilter[]).map((option) => (
          <button
            key={option}
            type="button"
            className={`search-filter-button ${filter === option ? 'active' : ''}`}
            onClick={() => setFilter(option)}
          >
            {option.charAt(0).toUpperCase() + option.slice(1)}
          </button>
        ))}
      </div>

      <div className="search-history">
        <div className="search-section-title">Recent Searches</div>
        <div className="search-history-chips">
          {history.length === 0 ? (
            <span className="search-empty">No search history yet.</span>
          ) : (
            history.map((item) => (
              <button
                key={item}
                type="button"
                className="history-chip"
                onClick={() => handleInputChange(item)}
              >
                {item}
              </button>
            ))
          )}
        </div>
      </div>

      {loading ? (
        <div className="search-empty">Loading search catalog...</div>
      ) : (
        <div className="search-results">
          {(filter === 'all' || filter === 'songs') && (
            <div className="search-section">
              <div className="search-section-title">Songs</div>
              {filteredSongs.length > 0 ? renderSongs(filteredSongs) : <div className="search-empty">No songs found.</div>}
            </div>
          )}

          {(filter === 'all' || filter === 'playlists') && (
            <div className="search-section">
              <div className="search-section-title">Playlists</div>
              {filteredPlaylists.length > 0 ? (
                renderPlaylists(filteredPlaylists)
              ) : (
                <div className="search-empty">No playlists found.</div>
              )}
            </div>
          )}

          {(filter === 'all' || filter === 'artists') && (
            <div className="search-section">
              <div className="search-section-title">Artists</div>
              {filteredArtists.length > 0 ? renderArtists(filteredArtists) : <div className="search-empty">No artists found.</div>}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default SearchPage;
