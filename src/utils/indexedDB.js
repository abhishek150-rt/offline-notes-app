const DB_NAME = "NotesDB";
const DB_VERSION = 1;
const STORE_NAME = "notes";

let db = null;

export const initDB = async () => {
  if (db) return db;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error("Failed to open database:", request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Delete existing store if it exists to recreate with proper indexes
      if (database.objectStoreNames.contains(STORE_NAME)) {
        database.deleteObjectStore(STORE_NAME);
      }

      const store = database.createObjectStore(STORE_NAME, { keyPath: "id" });

      // Create indexes with proper key paths
      store.createIndex("synced", "synced", { unique: false });
      store.createIndex("syncStatus", "syncStatus", { unique: false });
      store.createIndex("updatedAt", "updatedAt", { unique: false });
    };
  });
};

export const addNote = async (note) => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  // Ensure the note has all required fields with proper types
  const noteToAdd = {
    ...note,
    synced: Boolean(note.synced || false),
    syncStatus: note.syncStatus || "unsynced",
    updatedAt: note.updatedAt || new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = store.add(noteToAdd);

    request.onsuccess = () => resolve(noteToAdd);
    request.onerror = () => {
      console.error("Failed to add note:", request.error);
      reject(request.error);
    };
  });
};

export const updateNote = async (note) => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  // Ensure the note has all required fields with proper types
  const noteToUpdate = {
    ...note,
    synced: Boolean(note.synced || false),
    syncStatus: note.syncStatus || "unsynced",
    updatedAt: note.updatedAt || new Date().toISOString(),
  };

  return new Promise((resolve, reject) => {
    const request = store.put(noteToUpdate);

    request.onsuccess = () => resolve(noteToUpdate);
    request.onerror = () => {
      console.error("Failed to update note:", request.error);
      reject(request.error);
    };
  });
};

export const getNote = async (id) => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => {
      console.error("Failed to get note:", request.error);
      reject(request.error);
    };
  });
};

export const getAllNotes = async () => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      const notes = request.result || [];
      // Ensure all notes have proper boolean and string types
      const normalizedNotes = notes.map((note) => ({
        ...note,
        synced: Boolean(note.synced),
        syncStatus: note.syncStatus || "unsynced",
      }));
      resolve(normalizedNotes);
    };

    request.onerror = () => {
      console.error("Failed to get all notes:", request.error);
      reject(request.error);
    };
  });
};

export const getUnsyncedNotes = async () => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    // Use cursor instead of index.getAll() for better compatibility
    const request = store.openCursor();
    const unsyncedNotes = [];

    request.onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        const note = cursor.value;
        // Check for unsynced notes using multiple conditions
        if (
          !note.synced ||
          note.syncStatus === "unsynced" ||
          note.syncStatus === "error"
        ) {
          unsyncedNotes.push({
            ...note,
            synced: Boolean(note.synced),
            syncStatus: note.syncStatus || "unsynced",
          });
        }
        cursor.continue();
      } else {
        // No more entries
        resolve(unsyncedNotes);
      }
    };

    request.onerror = () => {
      console.error("Failed to get unsynced notes:", request.error);
      // Fallback: try to get all notes and filter manually
      getAllNotes()
        .then((allNotes) => {
          const unsynced = allNotes.filter(
            (note) =>
              !note.synced ||
              note.syncStatus === "unsynced" ||
              note.syncStatus === "error"
          );
          resolve(unsynced);
        })
        .catch(reject);
    };
  });
};

export const deleteNote = async (id) => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error("Failed to delete note:", request.error);
      reject(request.error);
    };
  });
};

export const clearAllNotes = async () => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  return new Promise((resolve, reject) => {
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => {
      console.error("Failed to clear notes:", request.error);
      reject(request.error);
    };
  });
};

// Utility function to ensure database is properly initialized
export const ensureDBReady = async () => {
  try {
    await initDB();
    console.log("Database is ready");
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
};

// Alternative method using IDBKeyRange for more reliable querying
export const getUnsyncedNotesWithRange = async () => {
  const database = await initDB();
  const tx = database.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);

  try {
    // Try using the synced index with IDBKeyRange
    const index = store.index("synced");
    const range = IDBKeyRange.only(false);

    return new Promise((resolve, reject) => {
      const request = index.getAll(range);

      request.onsuccess = () => {
        const notes = request.result || [];
        const normalizedNotes = notes.map((note) => ({
          ...note,
          synced: Boolean(note.synced),
          syncStatus: note.syncStatus || "unsynced",
        }));
        resolve(normalizedNotes);
      };

      request.onerror = () => {
        console.error(
          "Failed to get unsynced notes with range:",
          request.error
        );
        // Fallback to cursor method
        getUnsyncedNotes().then(resolve).catch(reject);
      };
    });
  } catch (error) {
    console.error("Index query failed, falling back to cursor method:", error);
    return getUnsyncedNotes();
  }
};
