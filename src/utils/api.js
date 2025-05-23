const API_BASE_URL = "http://localhost:3001";

class APIError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const handleResponse = async (response) => {
  if (!response.ok) {
    throw new APIError(`API Error: ${response.statusText}`, response.status);
  }
  return response.json();
};

export const api = {
  async fetchNotes() {
    const response = await fetch(`${API_BASE_URL}/notes`);
    return handleResponse(response);
  },

  async checkNoteExists(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: "HEAD",
      });
      return response.ok;
    } catch (error) {
      try {
        const response = await fetch(`${API_BASE_URL}/notes/${id}`);
        return response.ok;
      } catch (getError) {
        console.error("Error checking note existence:", getError);
        return false;
      }
    }
  },

  async getNoteById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`);
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error("Error fetching note by ID:", error);
      return null;
    }
  },

  async createNote(note) {
    const exists = await this.checkNoteExists(note.id);

    if (exists) {
      return await this.updateNote(note.id, note);
    }

    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });
    return handleResponse(response);
  },

  async updateNote(id, note) {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(note),
    });

    return handleResponse(response);
  },

  async createOrUpdateNote(note) {
 
    try {
      const existingNote = await this.getNoteById(note.id);

      if (existingNote) {
        return await this.updateNote(note.id, note);
      } else {
        return await this.createNote(note);
      }
    } catch (error) {
      console.error("Error in createOrUpdateNote:", error);
      throw error;
    }
  },

  async deleteNote(id) {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      throw new APIError(`API Error: ${response.statusText}`, response.status);
    }
  },
};
