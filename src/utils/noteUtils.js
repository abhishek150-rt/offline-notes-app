export const deduplicateNotes = (notes) => {
  const map = new Map();
  for (const note of notes) {
    if (
      !map.has(note.id) ||
      new Date(note.updatedAt) > new Date(map.get(note.id).updatedAt)
    ) {
      map.set(note.id, note);
    }
  }
  return Array.from(map.values());
};

export const mergeNotesFromServer = (localNotes, serverNotes) => {
  const mergedMap = new Map();
  localNotes.forEach((note) => mergedMap.set(note.id, { ...note }));

  serverNotes.forEach((serverNote) => {
    const local = mergedMap.get(serverNote.id);
    const enhancedServerNote = {
      ...serverNote,
      synced: true,
      syncStatus: "synced",
    };
    if (
      !local ||
      (local.synced &&
        new Date(serverNote.updatedAt) > new Date(local.updatedAt))
    ) {
      mergedMap.set(serverNote.id, enhancedServerNote);
    }
  });

  return Array.from(mergedMap.values());
};
