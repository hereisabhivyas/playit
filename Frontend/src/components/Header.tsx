import React, { useState } from 'react';
import '../styles/header.css';

interface HeaderProps {
  onSearch?: (query: string) => void;
  onProfileClick?: () => void;
  onHomeClick?: () => void;
  onLogout?: () => void;
  onNavigateBack?: () => void;
  onNavigateForward?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  onProfileClick,
  onHomeClick,
  onLogout,
  onNavigateBack,
  onNavigateForward,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    onSearch?.(query);
  };

  return (
    <header className="header">
      <div className="header-left">
        <div className="header-nav-buttons">
          <button className="nav-button" title="Previous" onClick={onNavigateBack} type="button" aria-label="Previous view">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15.5 5L8.5 12L15.5 19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="nav-button" title="Next" onClick={onNavigateForward} type="button" aria-label="Next view">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M8.5 5L15.5 12L8.5 19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="header-search">
          <input
            type="text"
            className="search-input"
            placeholder="Search songs, artists, albums..."
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>
      <div className="header-right">
        {onHomeClick && (
          <button className="header-button" onClick={onHomeClick} title="Home" type="button" aria-label="Go to home">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3.5 10.8L12 4l8.5 6.8v8.2a1 1 0 0 1-1 1h-5.4a1 1 0 0 1-1-1v-4.1h-2.2V19a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1v-8.2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {onProfileClick && (
          <button className="header-button" onClick={onProfileClick} title="Profile" type="button" aria-label="Open profile">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" />
              <path d="M5 19.3c1.6-3.1 4-4.7 7-4.7s5.4 1.6 7 4.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {onLogout && (
          <button className="header-button" onClick={onLogout} title="Logout" type="button" aria-label="Logout">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M10 4.8H6.8A1.8 1.8 0 0 0 5 6.6v10.8a1.8 1.8 0 0 0 1.8 1.8H10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
              <path d="M14.8 8.3L19 12l-4.2 3.7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M11 12h8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
