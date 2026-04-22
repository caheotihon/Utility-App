import React, { createContext, useContext, useState, useEffect } from 'react';

const NoteContext = createContext();

export function NoteProvider({ children }) {
  const [notes, setNotes] = useState([]);

  // Load notes từ File hệ thống qua Eel khi khởi chạy
  useEffect(() => {
    if (window.eel) {
      window.eel.get_notes()((savedNotes) => {
        setNotes(savedNotes || []);
      });
    }
  }, []);

  const addNote = (note) => {
    const newNote = { 
      id: Date.now(), 
      title: 'Ghi chú mới', 
      content: '', 
      createdAt: new Date().toISOString(), 
      ...note 
    };
    
    setNotes(prev => [newNote, ...prev]);
    
    // Lưu vào file ngay khi tạo
    if (window.eel) {
      window.eel.save_single_note(newNote);
    }
  };

  const updateNote = (id, updates) => {
    setNotes(prev => {
      const updatedNotes = prev.map(note => {
        if (note.id === id) {
          const updated = { ...note, ...updates };
          // Lưu vào file khi có cập nhật
          if (window.eel) {
            window.eel.save_single_note(updated);
          }
          return updated;
        }
        return note;
      });
      return updatedNotes;
    });
  };

  const deleteNote = (id) => {
    setNotes(prev => prev.filter(note => note.id !== id));
    // Xoá file vật lý
    if (window.eel) {
      window.eel.delete_single_note(id);
    }
  };

  return (
    <NoteContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
      {children}
    </NoteContext.Provider>
  );
}

export const useNotes = () => useContext(NoteContext);
