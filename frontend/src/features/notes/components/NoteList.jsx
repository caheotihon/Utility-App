import React, { useState } from 'react';
import { Plus, Trash2, FileText, Search } from 'lucide-react';
import ConfirmModal from '../../../components/ConfirmModal';

export default function NoteList({ notes, activeNoteId, setActiveNoteId, addNote, deleteNote }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [pendingDeleteId, setPendingDeleteId] = useState(null);

    return (
        <div className="flex flex-col h-full">
            <div className="p-5 flex justify-between items-center shrink-0 border-b border-black/5 dark:border-white/5">
                <h2 className="text-2xl font-bold dark:text-white">Ghi chú</h2>
                <button
                    onClick={addNote}
                    className="cursor-pointer p-2 hover:bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 rounded-full transition-colors"
                >
                    <Plus className="w-6 h-6" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 pb-4 space-y-1">
                {notes.length === 0 ? (
                    <div className="text-center mt-10 text-gray-400 text-sm">Chưa có ghi chú nào</div>
                ) : (
                    notes.map(note => (
                        <div
                            key={note.id}
                            onClick={() => setActiveNoteId(note.id)}
                            className={`group p-4 rounded-xl cursor-pointer transition-all ${activeNoteId === note.id
                                ? 'bg-yellow-500/10 dark:bg-yellow-500/20'
                                : 'hover:bg-black/[0.03] dark:hover:bg-white/[0.03]'
                                }`}
                        >
                            <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold truncate text-[15px] ${activeNoteId === note.id ? 'text-yellow-700 dark:text-yellow-400' : 'text-gray-800 dark:text-gray-200'}`}>
                                        {note.title || 'Ghi chú mới'}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                                        {note.content || 'Không có nội dung thêm'}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setPendingDeleteId(note.id);
                                        setIsModalOpen(true);
                                    }}
                                    className="cursor-pointer opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={() => {
                    deleteNote(pendingDeleteId);
                    setIsModalOpen(false);
                }}
                title="Xóa ghi chú?"
                message="Bạn không thể hoàn tác hành động này."
            />
        </div>
    );
}