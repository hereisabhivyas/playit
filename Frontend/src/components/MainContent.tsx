import React, { useState, useEffect } from 'react';
import type { Song, Playlist, Artist } from '../types';
import { fetchPlaylists, fetchSongs, fetchArtists } from '../services/api';
import '../styles/main-content.css';

interface MainContentProps {
  onSongSelect: (song: Song) => void;
  onPlaylistSelect: (playlist: Playlist) => void;
}

const MainContent: React.FC<MainContentProps> = ({ onSongSelect, onPlaylistSelect }) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [newReleases, setNewReleases] = useState<Song[]>([]);
  const [topArtists, setTopArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [playlistsData, songsData, artistsData] = await Promise.all([
          fetchPlaylists(),
          fetchSongs(),
          fetchArtists(),
        ]);
        setPlaylists(playlistsData);
        setNewReleases(songsData);
        setTopArtists(artistsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <main className="main-content">
      <div className="content-wrapper">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="hero-section">
              <h1 className="hero-title">Good Morning, Music Lover ♫</h1>
              <p className="hero-description">
                Discover new music, create playlists, and enjoy your favorite tracks anytime, anywhere.
              </p>
            </section>

            {/* Featured Playlists */}
            {playlists.length > 0 && (
              <section className="section">
                <div className="section-title">
                  <span>Featured Playlists</span>
                  <a className="see-all-link">See all</a>
                </div>
                <div className="grid grid-cols-4">
                  {playlists.map((playlist) => (
                    <div
                      key={playlist.id}
                      className="card"
                      onClick={() => onPlaylistSelect(playlist)}
                    >
                      <img
                        src={playlist.cover}
                        alt={playlist.name}
                        className="card-image"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/180x180?text=Playlist';
                        }}
                      />
                      <h3 className="card-title">{playlist.name}</h3>
                      <p className="card-subtitle">{playlist.description}</p>
                      <button
                        className="play-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onPlaylistSelect(playlist);
                        }}
                      >
                        ▶
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* New Releases */}
            {newReleases.length > 0 && (
              <section className="section">
                <div className="section-title">
                  <span>New Releases</span>
                  <a className="see-all-link">See all</a>
                </div>
                <div className="grid grid-cols-4">
                  {newReleases.map((song) => (
                    <div
                      key={song.id}
                      className="card"
                      onClick={() => onSongSelect(song)}
                    >
                      <img
                        src={song.cover}
                        alt={song.title}
                        className="card-image"
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/180x180?text=Song';
                        }}
                      />
                      <h3 className="card-title">{song.title}</h3>
                      <p className="card-subtitle">{song.artist}</p>
                      <button
                        className="play-button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onSongSelect(song);
                        }}
                      >
                        ▶
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Popular Artists */}
            {topArtists.length > 0 && (
              <section className="section">
                <div className="section-title">
                  <span>Popular Artists</span>
                  <a className="see-all-link">See all</a>
                </div>
                <div className="grid grid-cols-6">
                  {topArtists.map((artist) => (
                    <div key={artist.id} className="card">
                      <img
                        src={artist.image}
                        alt={artist.name}
                        className="card-image"
                        style={{ borderRadius: '50%' }}
                        onError={(e) => {
                          e.currentTarget.src = 'https://via.placeholder.com/150x150?text=Artist';
                        }}
                      />
                      <h3 className="card-title">{artist.name}</h3>
                      <p className="card-subtitle">Artist</p>
                      <button className="play-button">▶</button>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default MainContent;
