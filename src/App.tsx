import React from 'react';
import { Layout } from './components/Layout';
import { SongMetadata } from './components/SongMetadata';
import { SectionList } from './components/SectionList';
import { useSongStore } from './store/useSongStore';
import { PDFViewer } from '@react-pdf/renderer';
import { SongPDF } from './components/SongPDF';

function App() {
  const song = useSongStore((state) => state.song);

  return (
    <Layout
      editor={
        <div className="space-y-6">
          <SongMetadata />

          <div className="pb-10">
            <SectionList />
          </div>
        </div>
      }
      preview={
        <div className="w-full h-full shadow-2xl rounded-sm overflow-hidden bg-slate-900 border border-slate-700">
          <PDFViewer width="100%" height="100%" showToolbar={true} className="w-full h-full">
            <SongPDF song={song} />
          </PDFViewer>
        </div>
      }
    />
  );
}

export default App;
