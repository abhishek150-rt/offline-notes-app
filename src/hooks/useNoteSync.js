import { useRef } from "react";
import { deduplicateNotes, mergeNotesFromServer } from "../utils/noteUtils";
import * as db from "../utils/indexedDB";
import { api } from "../utils/api";

export const useNoteSync = (dispatch, isOnline, hasLoadedInitialData) => {
  const syncingNotesRef = useRef(new Set());
  const pendingUpdatesRef = useRef(new Map());

  const syncNote = async (note) => {
    if (syncingNotesRef.current.has(note.id)) return;
    syncingNotesRef.current.add(note.id);

    dispatch({
      type: "SET_SYNC_STATUS",
      payload: { id: note.id, status: "syncing" },
    });

    try {
      const syncedNote = await api.createOrUpdateNote({
        ...note,
        synced: true,
        syncStatus: "synced",
      });

      const updated = {
        ...note,
        ...syncedNote,
        synced: true,
        syncStatus: "synced",
      };
      await db.updateNote(updated);
      dispatch({ type: "UPDATE_NOTE", payload: updated });

      return updated;
    } catch (err) {
      dispatch({
        type: "SET_SYNC_STATUS",
        payload: { id: note.id, status: "error" },
      });
    } finally {
      syncingNotesRef.current.delete(note.id);
    }
  };

  const syncAll = async () => {
    if (!isOnline) return;

    dispatch({ type: "SET_SYNCING", payload: true });

    try {
      const unsynced = deduplicateNotes(await db.getUnsyncedNotes());
      for (const note of unsynced) {
        await syncNote(note);
      }

      const refreshed = deduplicateNotes(await db.getAllNotes());
      dispatch({ type: "SET_NOTES", payload: refreshed });
    } catch (err) {
      console.error("Error syncing all notes:", err);
    } finally {
      dispatch({ type: "SET_SYNCING", payload: false });
    }
  };

  const getPendingUpdatesRef = () => pendingUpdatesRef;

  return { syncNote, syncAll, pendingUpdatesRef: getPendingUpdatesRef() };
};
