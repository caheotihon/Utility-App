import React from 'react';
import {
    FileText,
    Calendar,
} from 'lucide-react';

export default function NoteEditor({ activeNote, updateNote, deleteNote }) {
    const [copied, setCopied] = React.useState(false);

    if (!activeNote) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                <FileText className="w-16 h-16 mb-4 opacity-10" />
                <p className="italic">Chọn một ghi chú để bắt đầu</p>
            </div>
        );
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(`${activeNote.title}\n${activeNote.content}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex-1 flex flex-col h-full relative bg-white dark:bg-[#0b0e14]">

            {/* Header thông tin nhỏ phía trên */}
            <div className="px-8 py-3 flex items-center text-[12px] text-gray-400 font-medium border-b border-black/[0.02] dark:border-white/[0.02]">
                <Calendar className="w-3.5 h-3.5 mr-2 text-yellow-500" />
                {new Date(activeNote.id).toLocaleDateString('vi-VN')}
                <span className="mx-3 opacity-20">|</span>
                <span>{activeNote.content?.length || 0} ký tự</span>
            </div>

            {/* Vùng soạn thảo */}
            <div className="flex-1 flex flex-col px-8 md:px-20 py-10 overflow-y-auto pb-32">
                <input
                    value={activeNote.title}
                    onChange={(e) => updateNote(activeNote.id, { title: e.target.value })}
                    className="text-4xl font-black bg-transparent border-none outline-none text-gray-900 dark:text-white mb-6 placeholder-gray-200 dark:placeholder-gray-800"
                    placeholder="Tiêu đề"
                />
                <textarea
                    value={activeNote.content}
                    onChange={(e) => updateNote(activeNote.id, { content: e.target.value })}
                    className="flex-1 bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 resize-none text-xl leading-relaxed placeholder-gray-400"
                    placeholder="Bắt đầu viết..."
                />
            </div>
        </div>
    );
}