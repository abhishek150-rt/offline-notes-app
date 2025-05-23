import { createContext, useContext } from "react";
export const NotesContext = createContext();

export const useNotes = () => {
  const context = useContext(NotesContext);
  if (!context) throw new Error("useNotes must be used within a NotesProvider");
  return context;
};
