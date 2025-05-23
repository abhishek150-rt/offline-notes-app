import React, { useReducer, useEffect, useRef } from "react";
import { NotesContext } from "../context/NotesContext";
import { notesReducer } from "../reducers/notesReducer";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import * as db from "../utils/indexedDB";
import { api } from "../utils/api";
import { useNoteSync } from "../hooks/useNoteSync";
import { mergeNotesFromServer, deduplicateNotes } from "../utils/noteUtils";
import { v4 as uuidv4 } from "uuid";

export const NotesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, {
    notes: [],
    isSyncing: false,
    isLoading: true,
  });

  const isOnline = useOnlineStatus();
  const hasLoadedInitialData = useRef(false);
  const { syncNote, syncAll, pendingUpdatesRef } = useNoteSync(
    dispatch,
    isOnline,
    hasLoadedInitialData
  );

  useEffect(() => {
    const loadNotes = async () => {
      if (hasLoadedInitialData.current) return;
      dispatch({ type: "SET_LOADING", payload: true });

      const localNotes = deduplicateNotes(await db.getAllNotes()).sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      dispatch({ type: "SET_NOTES", payload: localNotes });

      if (isOnline) {
        const serverNotes = await api.fetchNotes();
        const merged = mergeNotesFromServer(localNotes, serverNotes);
        for (const note of merged) await db.updateNote(note);
        dispatch({ type: "SET_NOTES", payload: merged });
      }

      hasLoadedInitialData.current = true;
      dispatch({ type: "SET_LOADING", payload: false });
    };

    loadNotes();
  }, []);

  useEffect(() => {
    if (isOnline && hasLoadedInitialData.current) {
      syncAll();
    }
  }, [isOnline]);

  const createNote = async (title = "Untitled", content = "") => {
    const note = {
      id: uuidv4(),
      title,
      content,
      updatedAt: new Date().toISOString(),
      synced: false,
      syncStatus: "unsynced",
    };
    await db.addNote(note);
    dispatch({ type: "ADD_NOTE", payload: note });
    if (isOnline) syncNote(note);
    return note;
  };

  const updateNote = async (id, updates) => {
    const existing = await db.getNote(id);
    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      synced: false,
      syncStatus: "unsynced",
    };
    await db.updateNote(updated);
    dispatch({ type: "UPDATE_NOTE", payload: updated });

    if (isOnline) {
      const ref = pendingUpdatesRef.current;
      if (ref.has(id)) clearTimeout(ref.get(id));
      ref.set(
        id,
        setTimeout(() => {
          syncNote(updated);
          ref.delete(id);
        }, 500)
      );
    }

    return updated;
  };

  const deleteNote = async (id) => {
    if (pendingUpdatesRef.current.has(id)) {
      clearTimeout(pendingUpdatesRef.current.get(id));
      pendingUpdatesRef.current.delete(id);
    }

    await db.deleteNote(id);
    dispatch({ type: "DELETE_NOTE", payload: id });

    if (isOnline) {
      try {
        await api.deleteNote(id);
      } catch (e) {
        console.error("Error syncing deletion:", e);
      }
    }
  };

  return (
    <NotesContext.Provider
      value={{
        notes: state.notes,
        isSyncing: state.isSyncing,
        isLoading: state.isLoading,
        isOnline,
        createNote,
        updateNote,
        deleteNote,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};
