import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Song } from '../types';
import '../styles/player.css';

interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
}

const Player: React.FC<PlayerProps> = ({
  currentSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrevious,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [volume, setVolume] = useState(70);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');

  const streamSource = useMemo(() => {
    if (!currentSong) return '';
    if (currentSong.streamUrl) return currentSong.streamUrl;
    if (currentSong.id) return `http://localhost:5000/api/songs/${currentSong.id}/stream`;
    return '';
  }, [currentSong]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume / 100;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) {
      setCurrentTime(0);
      setAudioDuration(0);
      return;
    }

    audio.load();
    setCurrentTime(0);

    if (isPlaying) {
      audio.play().catch(() => {
        // Browser can block autoplay without user gesture.
      });
    }
  }, [currentSong, isPlaying, streamSource]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.play().catch(() => {
        // Browser can block autoplay without user gesture.
      });
      return;
    }

    audio.pause();
  }, [isPlaying, currentSong]);

  const formatTime = (seconds: number) => {
    if (!Number.isFinite(seconds) || seconds <= 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !audioDuration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const nextTime = Math.min(Math.max(percent, 0), 1) * audioDuration;
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleAudioEnded = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {
        // Browser can block autoplay without user gesture.
      });
      return;
    }

    onNext();
  };

  const progressWidth = audioDuration > 0 ? `${(currentTime / audioDuration) * 100}%` : '0%';
  const defaultCover = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 56"><rect fill="%23333" width="56" height="56"/><text x="50%" y="50%" font-size="12" fill="%23999" text-anchor="middle" dy=".3em">🎵</text></svg>';

  return (
    <div className="player">
      <audio
        ref={audioRef}
        src={streamSource || undefined}
        preload="metadata"
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => {
          const loadedDuration = event.currentTarget.duration;
          setAudioDuration(Number.isFinite(loadedDuration) ? loadedDuration : currentSong?.duration || 0);
        }}
        onEnded={handleAudioEnded}
      />

      <div className="player-container">
        <div className="player-track-info">
          <img
            src={currentSong?.cover || defaultCover}
            alt="track cover"
            className="player-cover"
            onError={(e) => {
              e.currentTarget.src = defaultCover;
            }}
          />
          <div className="player-track-details">
            <div className="player-track-title">
              {currentSong?.title || 'No Song Playing'}
            </div>
            <div className="player-track-artist">
              {currentSong?.artist || 'Unknown Artist'}
            </div>
          </div>
        </div>

        <div className="player-controls-center">
          <div className="player-buttons">
            <button
              className={`player-button ${isShuffle ? 'active' : ''}`}
              onClick={() => setIsShuffle(!isShuffle)}
              title="Shuffle"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M3.8 6h2.7c1.5 0 2.9.7 3.8 1.8l6.1 8.3c.9 1.2 2.3 1.9 3.8 1.9h.9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M3.8 18h2.7c1.4 0 2.8-.7 3.6-1.8l1.1-1.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M21.3 7.3L18.8 5v4.7l2.5-2.4zM21.3 19.3L18.8 17v4.7l2.5-2.4z" fill="currentColor" />
              </svg>
            </button>
            <button
              className="player-button"
              onClick={onPrevious}
              title="Previous"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M18.2 6.3L10.4 12l7.8 5.7V6.3z" fill="currentColor" />
                <path d="M8 6v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className="player-button player-button-play"
              onClick={onPlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
              type="button"
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <rect x="7.2" y="6" width="3.4" height="12" rx="1" fill="currentColor" />
                  <rect x="13.4" y="6" width="3.4" height="12" rx="1" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M8.5 6.2L18 12l-9.5 5.8V6.2z" fill="currentColor" />
                </svg>
              )}
            </button>
            <button
              className="player-button"
              onClick={onNext}
              title="Next"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5.8 6.3L13.6 12l-7.8 5.7V6.3z" fill="currentColor" />
                <path d="M16 6v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <button
              className={`player-button ${repeatMode !== 'off' ? 'active' : ''}`}
              onClick={() => {
                setRepeatMode(
                  repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off',
                );
              }}
              title="Repeat"
              type="button"
            >
              <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4.5 8.4h11.2c1.7 0 3 1.3 3 3v.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M16.6 5.8l2.8 2.8-2.8 2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.5 15.6H8.3c-1.7 0-3-1.3-3-3v-.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M7.4 18.2l-2.8-2.8 2.8-2.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {repeatMode === 'one' && <span className="repeat-one">1</span>}
            </button>
          </div>

          <div className="player-progress">
            <span className="player-time">{formatTime(currentTime)}</span>
            <div
              className="player-progress-bar"
              onClick={handleProgressClick}
            >
              <div
                className="player-progress-fill"
                style={{ width: progressWidth }}
              >
                <div
                  className="player-progress-handle"
                  style={{ left: progressWidth }}
                />
              </div>
            </div>
            <span className="player-time">
              {formatTime(audioDuration || currentSong?.duration || 0)}
            </span>
          </div>
        </div>

        <div className="player-controls-right">
          <button className="player-button" title="Queue" type="button">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 7.2h14M5 12h14M5 16.8h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
          <div className="player-volume">
            <span className="player-volume-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M5.2 14.5h3.6L13 18V6l-4.2 3.5H5.2v5z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                <path d="M16 9.2c1.5 1.6 1.5 4.1 0 5.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M18.8 6.8c2.8 3 2.8 7.4 0 10.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <div className="volume-slider">
              <div
                className="volume-fill"
                style={{ width: `${volume}%` }}
              />
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              style={{
                position: 'absolute',
                width: '120px',
                opacity: '0',
                cursor: 'pointer',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
