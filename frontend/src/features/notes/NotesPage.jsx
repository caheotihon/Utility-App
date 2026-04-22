import React, { useState } from 'react';
import { useNotes } from '../../context/NoteContext';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import { ChevronLeft } from 'lucide-react';

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [showEditorMobile, setShowEditorMobile] = useState(false);

  const activeNote = notes.find(n => n.id === activeNoteId);

  const handleSelectNote = (id) => {
    setActiveNoteId(id);
    setShowEditorMobile(true);
  };

  const handleCreateNote = () => {
    const newNote = addNote(); // Giả định addNote trả về note mới hoặc id
    if (newNote) {
      setActiveNoteId(newNote.id);
      setShowEditorMobile(true);
    }
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#0b0e14] rounded-2xl overflow-hidden border border-black/5 dark:border-white/10 transition-all duration-300">

      {/* List: Ẩn khi đang mở editor trên mobile */}
      <div className={`${showEditorMobile ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-black/[0.03] dark:border-white/[0.05] bg-gray-50/50 dark:bg-gray-900/20`}>
        <NoteList
          notes={notes}
          activeNoteId={activeNoteId}
          setActiveNoteId={handleSelectNote}
          addNote={handleCreateNote}
          deleteNote={deleteNote}
        />
      </div>

      {/* Editor: Hiện đè lên trên mobile */}
      <div className={`${showEditorMobile ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-[#0b0e14]`}>
        {showEditorMobile && (
          <div className="md:hidden p-4 border-b border-black/5 dark:border-white/5 flex items-center">
            <button
              onClick={() => setShowEditorMobile(false)}
              className="cursor-pointer flex items-center gap-1 text-yellow-600 dark:text-yellow-500 font-medium"
            >
              <ChevronLeft className="w-5 h-5" /> Ghi chú
            </button>
          </div>
        )}
        <NoteEditor activeNote={activeNote} updateNote={updateNote} />
      </div>
    </div>
  );
}