import React, { useState } from 'react';
import '../styles/header.css';

interface HeaderProps {
  onSearch?: (query: string) => void;
  username?: string;
  onProfileClick?: () => void;
  onHomeClick?: () => void;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onSearch,
  username,
  onProfileClick,
  onHomeClick,
  onLogout,
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
          <button className="nav-button" title="Previous">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15.5 5L8.5 12L15.5 19" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="nav-button" title="Next">
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
          <button className="header-button" onClick={onHomeClick}>
            Home
          </button>
        )}
        {onProfileClick && (
          <button className="header-button" onClick={onProfileClick}>
            Profile
          </button>
        )}
        {onLogout && (
          <button className="header-button" onClick={onLogout}>
            Logout
          </button>
        )}
        <button className="header-button primary">{username ? `@${username}` : 'Playit'}</button>
      </div>
    </header>
  );
};

export default Header;
