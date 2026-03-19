import React from 'react';
import '../styles/sidebar.css';

interface NavItem {
  id: 'home' | 'search' | 'library';
  label: string;
  icon: 'home' | 'search' | 'library';
  active?: boolean;
}

interface SidebarProps {
  activeNav: 'home' | 'search' | 'library';
  onNavChange: (id: 'home' | 'search' | 'library') => void;
  historyItems: Array<{
    key: string;
    id: string;
    name: string;
    image: string;
    type: 'song' | 'playlist';
  }>;
  onHistoryItemClick?: (key: string) => void;
  userName?: string;
  username?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onNavChange,
  historyItems,
  onHistoryItemClick,
  userName,
  username,
}) => {

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'search', label: 'Search', icon: 'search' },
    { id: 'library', label: 'Your Library', icon: 'library' },
  ];

  const renderNavIcon = (icon: NavItem['icon']) => {
    switch (icon) {
      case 'home':
        return (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3.5 10.8L12 4l8.5 6.8v8.2a1 1 0 0 1-1 1h-5.4a1 1 0 0 1-1-1v-4.1h-2.2V19a1 1 0 0 1-1 1H4.5a1 1 0 0 1-1-1v-8.2z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'search':
        return (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
            <path d="M16.2 16.2L20 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        );
      case 'library':
        return (
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 5.2h5.2V20H5V5.2z" stroke="currentColor" strokeWidth="1.7" />
            <path d="M12.4 4h5.6v16h-5.6V4z" stroke="currentColor" strokeWidth="1.7" />
            <path d="M5 8.8h5.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleNavClick = (id: 'home' | 'search' | 'library') => {
    onNavChange(id);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M14 4.5v10.2a2.8 2.8 0 1 1-1.6-2.5V6.9l7-1.7v8.1a2.8 2.8 0 1 1-1.6-2.5V3l-3.8 1.5z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span>Playit</span>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          {navItems.map((item) => (
            <a
              key={item.id}
              className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
            >
              <span className="nav-item-icon">{renderNavIcon(item.icon)}</span>
              <span>{item.label}</span>
            </a>
          ))}
        </div>

        <div className="nav-section">
          <div className="nav-section-title">Recently Played</div>
          <div className="sidebar-history-cards">
            {historyItems.length === 0 ? (
              <div className="history-empty">Your recent songs and playlists will appear here.</div>
            ) : (
              historyItems.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  className="history-card"
                  onClick={() => onHistoryItemClick?.(item.key)}
                  title={item.name}
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    onError={(event) => {
                      event.currentTarget.src =
                        item.type === 'song'
                          ? 'https://via.placeholder.com/56x56?text=Song'
                          : 'https://via.placeholder.com/56x56?text=List';
                    }}
                  />
                  <div className="history-card-info">
                    <div className="history-card-name">{item.name}</div>
                    <div className="history-card-type">{item.type}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-avatar">U</div>
        <div className="sidebar-footer-text">
          <div className="user-name">{userName || 'User'}</div>
          <div className="user-plan">{username ? `@${username}` : 'Premium'}</div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
