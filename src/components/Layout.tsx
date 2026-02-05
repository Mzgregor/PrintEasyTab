import React from 'react';

interface LayoutProps {
    editor: React.ReactNode;
    preview: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ editor, preview }) => {
    return (
        <div className="flex h-screen bg-black text-white overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Editor Panel - Sidebar Style */}
            <div className="w-[45%] lg:w-[40%] flex flex-col border-r border-[#2c2c2e] bg-[#000000]">
                <header className="px-6 py-4 border-b border-[#2c2c2e]/50 bg-[#000000]/80 backdrop-blur-xl sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500" />
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-8">
                    {editor}
                </div>
            </div>

            {/* Preview Panel - Main Content Style */}
            <div className="flex-1 bg-[#1c1c1e] flex flex-col relative">
                <header className="px-6 py-4 flex justify-between items-center absolute top-0 left-0 right-0 z-20 pointer-events-none">
                    {/* Floating Action Button for PDF */}
                    <div className="ml-auto pointer-events-auto">
                        <button className="ios-btn flex items-center gap-2">
                            <span>Download PDF</span>
                        </button>
                    </div>
                </header>

                {/* Center the PDF Preivew */}
                <div className="flex-1 overflow-hidden p-8 flex items-center justify-center">
                    {preview}
                </div>
            </div>
        </div>
    );
};
