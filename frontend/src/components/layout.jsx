import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import BottomPlayer from './BottomPlayer'

export default function Layout({ children, activeTab, setActiveTab }) {
    return (
        <div className="flex flex-col h-screen w-full bg-white dark:bg-[#030303] text-gray-900 dark:text-gray-100 overflow-hidden font-sans transition-colors duration-300">
            {/* Top Header */}
            <Header />

            {/* Middle section (Sidebar + Main Content) */}
            <div className="flex flex-1 min-h-0 relative z-0">
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                
                <main className="flex-1 overflow-y-auto no-scrollbar relative z-0 bg-[#f9f9f9] dark:bg-[#0f0f0f]">
                    {children}
                </main>
            </div>

            {/* Bottom Player */}
            <BottomPlayer setActiveTab={setActiveTab} />
        </div>
    )
}
