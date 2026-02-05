import React from 'react';

interface LayoutProps {
    editor: React.ReactNode;
    preview: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ editor, preview }) => {
    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            {/* Editor Panel */}
            <div className="w-1/2 flex flex-col border-r border-slate-800">
                <header className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        PrintEasyTab
                    </h1>
                </header>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {editor}
                </div>
            </div>

            {/* Preview Panel */}
            <div className="w-1/2 bg-slate-900 flex flex-col">
                <header className="p-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm flex justify-between items-center">
                    <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Live Preview</h2>
                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-sm font-medium transition-colors shadow-lg shadow-indigo-500/20">
                        Download PDF
                    </button>
                </header>
                <div className="flex-1 overflow-hidden p-8 flex justify-center bg-slate-800/50">
                    {preview}
                </div>
            </div>
        </div>
    );
};
