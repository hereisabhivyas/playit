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
  const defaultCover = 'https://via.placeholder.com/56x56?text=Music';

  return (
    <div className="player">
      <audio
        ref={audioRef}
        src={streamSource}
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
            >
              🔀
            </button>
            <button
              className="player-button"
              onClick={onPrevious}
              title="Previous"
            >
              ⏮
            </button>
            <button
              className="player-button player-button-play"
              onClick={onPlayPause}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            <button
              className="player-button"
              onClick={onNext}
              title="Next"
            >
              ⏭
            </button>
            <button
              className={`player-button ${repeatMode !== 'off' ? 'active' : ''}`}
              onClick={() => {
                setRepeatMode(
                  repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off',
                );
              }}
              title="Repeat"
            >
              🔁{repeatMode === 'one' && ' 1'}
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
          <button className="player-button" title="Queue">
            📋
          </button>
          <div className="player-volume">
            <span style={{ fontSize: '16px' }}>🔊</span>
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
