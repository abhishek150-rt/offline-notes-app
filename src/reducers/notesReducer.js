import { deduplicateNotes } from "../utils/noteUtils";

export const notesReducer = (state, action) => {
  switch (action.type) {
    case "SET_NOTES":
      return { ...state, notes: deduplicateNotes(action.payload) };

    case "ADD_NOTE": {
      const exists = state.notes.find((n) => n.id === action.payload.id);
      const updatedNotes = exists
        ? state.notes.map((n) =>
            n.id === action.payload.id ? action.payload : n
          )
        : [action.payload, ...state.notes];
      return { ...state, notes: deduplicateNotes(updatedNotes) };
    }

    case "UPDATE_NOTE":
      return {
        ...state,
        notes: deduplicateNotes(
          state.notes.map((n) =>
            n.id === action.payload.id ? action.payload : n
          )
        ),
      };

    case "DELETE_NOTE":
      return {
        ...state,
        notes: state.notes.filter((n) => n.id !== action.payload),
      };

    case "SET_SYNC_STATUS":
      return {
        ...state,
        notes: deduplicateNotes(
          state.notes.map((n) =>
            n.id === action.payload.id
              ? { ...n, syncStatus: action.payload.status }
              : n
          )
        ),
      };

    case "SET_SYNCING":
      return { ...state, isSyncing: action.payload };

    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    default:
      return state;
  }
};
