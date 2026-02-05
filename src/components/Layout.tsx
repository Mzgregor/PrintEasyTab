
import React from 'react';
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from 'react-resizable-panels';

interface LayoutProps {
    editor: React.ReactNode;
    preview: React.ReactNode;
    headerActions?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ editor, preview, headerActions }) => {
    return (
        <div className="h-screen bg-black text-white overflow-hidden font-sans selection:bg-blue-500/30">
            <PanelGroup orientation="horizontal">
                {/* Editor Panel - Sidebar Style */}
                <Panel defaultSize={50} minSize={20} className="flex flex-col border-r border-[#2c2c2e] bg-[#000000]">
                    <header className="px-6 py-4 border-b border-[#2c2c2e]/50 bg-[#000000]/80 backdrop-blur-xl sticky top-0 z-10 w-full">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar space-y-8 w-full">
                        {editor}
                    </div>
                </Panel>

                <PanelResizeHandle className="w-1 bg-[#1c1c1e] hover:bg-[#0a84ff] transition-colors flex items-center justify-center cursor-col-resize group z-50">
                    <div className="w-0.5 h-8 bg-[#3a3a3c] group-hover:bg-white rounded-full transition-colors" />
                </PanelResizeHandle>

                {/* Preview Panel - Main Content Style */}
                <Panel defaultSize={50} minSize={20} className="flex flex-col relative bg-[#1c1c1e]">
                    {/* Dedicated Options Toolbar */}
                    <header className="px-6 py-4 border-b border-[#2c2c2e] bg-[#1c1c1e] flex justify-between items-center z-20 w-full">
                        <h2 className="text-[13px] font-semibold text-[#8e8e93] uppercase tracking-wider">Preview</h2>

                        <div className="flex items-center gap-3">
                            {headerActions}
                        </div>
                    </header>

                    {/* Center the PDF Preivew */}
                    <div className="flex-1 overflow-hidden p-8 flex items-center justify-center bg-[#151516] w-full">
                        {preview}
                    </div>
                </Panel>
            </PanelGroup>
        </div>
    );
};
