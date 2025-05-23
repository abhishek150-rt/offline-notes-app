import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { useDebounce } from "../hooks/useDebounce";
import { useNotes } from "../context/NotesContext";

const NoteEditor = ({ noteId }) => {
  const { notes, updateNote } = useNotes();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const debouncedTitle = useDebounce(title, 500);
  const debouncedContent = useDebounce(content, 500);

  const currentNote = notes.find((note) => note.id === noteId);

  useEffect(() => {
    if (noteId && currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setLastSaved(new Date());
    }
  }, [noteId]);

  // Auto-save when debounced values change
  useEffect(() => {
    if (
      currentNote &&
      (debouncedTitle !== currentNote.title ||
        debouncedContent !== currentNote.content)
    ) {
      updateNote(noteId, { title: debouncedTitle, content: debouncedContent });
      setLastSaved(new Date());
    }
  }, [debouncedTitle, debouncedContent, noteId, currentNote, updateNote]);

  const formatLastSaved = (date) => {
    if (!date) return "";
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 5) return "Saved just now ✨";
    if (diff < 60) return `Saved ${diff}s ago`;
    if (diff < 3600) return `Saved ${Math.floor(diff / 60)}m ago`;
    return `Saved at ${date.toLocaleTimeString()}`;
  };

  if (!currentNote) {
    return (
      <div className="note-editor empty">
        <div className="empty-editor">✍️</div>
        <div>
          <h3>Ready to write?</h3>
          <p>
            Select a note from the sidebar or create a new one to start writing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <div className="editor-header">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your note a title..."
          className="title-input"
        />
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          {lastSaved && (
            <span
              style={{
                fontSize: "0.8rem",
                color: "var(--text-muted)",
                fontWeight: "500",
              }}
            >
              {formatLastSaved(lastSaved)}
            </span>
          )}
          <button
            onClick={() => setIsPreview(!isPreview)}
            className={`btn ${isPreview ? "btn-secondary" : "btn-primary"}`}
          >
            {isPreview ? "✏️ Edit" : "👁️ Preview"}
          </button>
        </div>
      </div>

      <div className="editor-content">
        {isPreview ? (
          <div className="markdown-preview">
            {content ? (
              <ReactMarkdown>{content}</ReactMarkdown>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-muted)",
                  marginTop: "2rem",
                  fontStyle: "italic",
                }}
              >
                <p>Nothing to preview yet...</p>
                <p>Switch to edit mode and start writing!</p>
              </div>
            )}
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your note in Markdown..."
            className="content-textarea"
          />
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
