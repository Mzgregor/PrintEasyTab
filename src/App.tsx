import React from 'react';
import { Layout } from './components/Layout';
import { useSongStore } from './store/useSongStore';
import { PDFViewer } from '@react-pdf/renderer';
import { SongPDF } from './components/SongPDF';
import { SongBlock } from './components/SongBlock';

function App() {
  const songs = useSongStore((state) => state.songs);

  return (
    <Layout
      editor={
        <div className="space-y-8 pb-10">
          {songs.map((song, index) => (
            <SongBlock key={song.id} song={song} index={index} />
          ))}
        </div>
      }
      preview={
        <div className="w-full h-full shadow-2xl rounded-sm overflow-hidden bg-slate-900 border border-slate-700">
          <PDFViewer width="100%" height="100%" showToolbar={true} className="w-full h-full">
            <SongPDF songs={songs} />
          </PDFViewer>
        </div>
      }
    />
  );
}

export default App;
