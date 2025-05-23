import React, { useState } from "react";
import { NotesProvider } from "./Providers/NotesProvider";
import { useNotes } from "./context/NotesContext";
import Header from "./components/Header";
import NotesList from "./components/NotesList";
import NoteEditor from "./components/NoteEditor";
import "./App.css";

const AppContent = () => {
  const { notes, createNote, deleteNote } = useNotes();
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const handleCreateNote = async () => {
    try {
      const newNote = await createNote(
        "New Note",
        "# Welcome to your new note!\n\nStart writing here..."
      );
      setSelectedNoteId(newNote.id);
    } catch (error) {
      console.error("Failed to create note:", error);
      alert("Failed to create note. Please try again.");
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      await deleteNote(noteId);
      if (selectedNoteId === noteId) {
        setSelectedNoteId(null);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
      alert("Failed to delete note. Please try again.");
    }
  };

  return (
    <div className="app">
      <Header
        onCreateNote={handleCreateNote}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      <div className="app-content">
        <div className="sidebar">
          <NotesList
            notes={notes}
            selectedNoteId={selectedNoteId}
            onSelectNote={setSelectedNoteId}
            onDeleteNote={handleDeleteNote}
            searchTerm={searchTerm}
          />
        </div>
        <div className="main-content">
          <NoteEditor noteId={selectedNoteId} />
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <NotesProvider>
      <AppContent />
    </NotesProvider>
  );
};

export default App;
