# Offline-First Notes App

A React-based markdown notes application that works seamlessly offline and syncs data when online. Built with IndexedDB for local persistence and featuring real-time sync capabilities.

## 🚀 Features

- ✅ **Offline-First**: Full functionality without internet connection
- ✅ **Markdown Support**: Rich text editing with live preview
- ✅ **Auto-sync**: Automatic synchronization when online
- ✅ **Auto-save**: Debounced saving (500ms) while typing
- ✅ **Search**: Filter notes by title or content
- ✅ **Responsive**: Works on desktop and mobile
- ✅ **Connection Awareness**: Visual indicators for online/offline status
- ✅ **Sync Status**: Per-note sync status indicators
- ✅ **Conflict Resolution**: Last-write-wins strategy

## 🛠️ Tech Stack

- **Frontend**: React 18 with Hooks & Context API
- **Storage**: IndexedDB (via `idb` library)
- **Markdown**: `react-markdown` for rendering
- **Mock API**: `json-server` for development
- **Styling**: Vanilla CSS with responsive design

## 📦 Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/abhishek150-rt/offline-notes-app.git
cd offline-notes-app

# Install dependencies
npm install

# Install json-server globally (for mock API)
npm install -g json-server
```

### 2. Setup Mock API

Create a `db.json` file in the project root:

```json
{
  "notes": []
}
```

### 3. Start the Application

You need to run both the React app and the mock API server:

```bash
# Terminal 1: Start the mock API server
npm run server
# This starts json-server on http://localhost:3001

# Terminal 2: Start the React app
npm start
# This starts the app on http://localhost:3000
```

## 🎯 Usage

### Creating Notes

1. Click the "New Note" button in the header
2. Enter a title and start writing in Markdown
3. Notes auto-save every 500ms while typing

### Editing Notes

1. Click on any note from the sidebar to select it
2. Edit the title or content directly
3. Use the "Preview" button to see rendered Markdown
4. Changes are saved automatically

### Offline Mode

1. Disconnect your internet or use browser dev tools to simulate offline
2. Continue creating/editing notes normally
3. Notes are stored locally in IndexedDB
4. When you reconnect, unsaved changes sync automatically

### Search

- Use the search bar in the header to filter notes
- Search works across both title and content
- Results update in real-time as you type

## 🏗️ Architecture & Design Decisions

### State Management

- **React Context + useReducer**: Chosen over Redux for simplicity
- **Local-first approach**: IndexedDB as the source of truth
- **Optimistic updates**: UI updates immediately, sync happens in background

### Data Flow

1. User actions update local IndexedDB immediately
2. UI reflects changes instantly (optimistic updates)
3. When online, changes sync to API in background
4. Sync status indicators show progress per note

### Offline Strategy

- **IndexedDB**: Persistent storage that survives browser restarts
- **Service Worker**: Not implemented (could be added for full PWA support)
- **Conflict Resolution**: Last-write-wins (client always wins for simplicity)

### Performance Optimizations

- **Debounced Auto-save**: Prevents excessive API calls while typing
- **Lazy Loading**: Notes loaded from IndexedDB on app start
- **Efficient Re-renders**: Context split and memo optimization where needed

## 🔧 Project Structure

```
src/
├── components/
│   ├── Header.jsx          # App header with search and actions
│   ├── NotesList.jsx       # Sidebar with notes list
│   └── NoteEditor.jsx      # Main editor with markdown support
├── context/
│   └── NotesContext.js    # Global state management
├── hooks/
│   ├── useOnlineStatus.js # Network connectivity detection
│   └── useDebounce.js     # Debounced value hook
│   └── useNoteSync.js     # Notes sync
├── Providers/
│   ├── NotesProvider.js  #Notes providers
├── reducers/
│   ├── notesReducer.js   #Notes reducers
├── utils/
│   ├── indexedDB.js       # IndexedDB operations
│   └── api.js             # API client functions
│   └── noteUtils.js       # Notes utility
├── App.jsx                 # Main app component
├── App.css                # Styles
└── index.js               # App entry point
```

## 🎨 Customization

### Styling

- Edit `src/App.css` for custom styles
- The app uses CSS custom properties for easy theming
- Responsive breakpoints are defined for mobile support

### API Integration

- Replace `json-server` with your real backend
- Update API endpoints in `src/utils/api.js`
- Modify the data model in `src/context/NotesContext.js` if needed

## 🔄 Sync Behavior

### When Online

- New notes sync immediately after creation
- Edits sync after 500ms debounce delay
- Failed syncs show error status and can be retried

### When Offline

- All operations work normally using IndexedDB
- Sync status shows "unsynced" for modified notes
- When connection returns, all unsynced notes sync automatically

### Sync Status Indicators

- ⏳ **Unsynced**: Note has local changes not yet synced
- 🔄 **Syncing**: Currently uploading to server
- ✅ **Synced**: Successfully saved to server
- ❌ **Error**: Sync failed (will retry when online)

## 🐛 Known Limitations

1. **No Real Auth**: Currently no user authentication
2. **Simple Conflict Resolution**: Last-write-wins only
3. **No Service Worker**: Not a full PWA (could be added)
4. **Limited File Support**: No image/file uploads
5. **Single User**: No multi-user collaboration

**Debugging Offline Mode:**

- Use Chrome DevTools > Network tab > "Offline" checkbox
- Or use Application tab > Service Workers > "Offline"

**Viewing IndexedDB:**

- Chrome DevTools > Application tab > Storage > IndexedDB
- Inspect stored notes and their sync status

**API Testing:**

- Visit http://localhost:3001/notes to see API data
- Use Postman/curl to test API endpoints directly
