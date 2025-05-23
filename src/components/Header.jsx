import React from "react";
import { useNotes } from "../context/NotesContext";

const Header = ({ onCreateNote, searchTerm, onSearchChange }) => {
  const { isOnline, isSyncing } = useNotes();

  return (
    <header className="header">
      <div className="header-content">
        <h1>📝 My Notes</h1>
        <div className="header-actions">
          <input
            type="text"
            placeholder="🔍 Search your notes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="search-input"
          />
          <button onClick={onCreateNote} className="btn btn-primary">
            ✨ New Note
          </button>
        </div>
      </div>
      <div className="status-bar">
        <div className={`connection-status ${isOnline ? "online" : "offline"}`}>
          {isOnline ? "🌐 Connected" : "📱 Offline Mode"}
        </div>
        {isSyncing && (
          <div className="sync-status">🔄 Syncing your notes...</div>
        )}
      </div>
    </header>
  );
};

export default Header;
