import React from "react";
import { useNotes } from "../context/NotesContext";

const getSyncStatusIcon = (syncStatus) => {
  switch (syncStatus) {
    case "synced":
      return "✅";
    case "syncing":
      return "🔄";
    case "error":
      return "❌";
    default:
      return "⏳";
  }
};

const getSyncStatusText = (syncStatus) => {
  switch (syncStatus) {
    case "synced":
      return "Synced";
    case "syncing":
      return "Syncing...";
    case "error":
      return "Sync Error";
    default:
      return "Not Synced";
  }
};

const NotesList = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onDeleteNote,
  searchTerm,
}) => {
  const { isLoading } = useNotes();

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  if (isLoading) {
    return (
      <div className="notes-list">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your notes...</p>
        </div>
      </div>
    );
  }

  if (filteredNotes.length === 0) {
    return (
      <div className="notes-list empty">
        <div className="empty-state">📝</div>
        <div>
          <h3>{searchTerm ? "No matching notes found" : "No notes yet"}</h3>
          <p>
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first note to get started!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="notes-list">
      {filteredNotes.map((note) => (
        <div
          key={note.id}
          className={`note-item ${
            selectedNoteId === note.id ? "selected" : ""
          }`}
          onClick={() => onSelectNote(note.id)}
        >
          <div className="note-header">
            <h3 className="note-title">{note.title || "Untitled Note"}</h3>
            <div className="note-actions">
              <span
                className="sync-icon"
                title={getSyncStatusText(note.syncStatus)}
              >
                {getSyncStatusIcon(note.syncStatus)}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    window.confirm("Are you sure you want to delete this note?")
                  ) {
                    onDeleteNote(note.id);
                  }
                }}
                className="btn btn-danger btn-small"
                title="Delete note"
              >
                🗑️
              </button>
            </div>
          </div>
          <p className="note-preview">
            {note.content
              ? note.content.substring(0, 120)
              : "No content yet..."}
            {note.content && note.content.length > 120 && "..."}
          </p>
          <div className="note-meta">
            📅 {formatDate(note.updatedAt)}
            {note.synced && <span>• 💾 Saved to cloud</span>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotesList;
