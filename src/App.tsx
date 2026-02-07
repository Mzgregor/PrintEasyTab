import React from 'react';
import { useSongStore } from './store/useSongStore';
import { Layout } from './components/Layout';
import { SongPDF } from './components/SongPDF';
import { SongBlock } from './components/SongBlock';
import { Metronome } from './components/Metronome';
import { Download } from 'lucide-react';
import { GuitarTuner } from './components/GuitarTuner';
import { HelpPage } from './components/HelpPage';
import { LoginPage } from './components/LoginPage';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen bg-zinc-900 text-red-500 p-10 font-mono overflow-auto">
          <h1 className="text-xl font-bold mb-4">Something went wrong.</h1>
          <pre className="bg-black p-4 rounded border border-red-900 whitespace-pre-wrap">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  const songs = useSongStore((state) => state.songs);
  const viewMode = useSongStore((state) => state.viewMode);
  const isAuthenticated = useSongStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <LoginPage />
      </ErrorBoundary>
    );
  }

  if (viewMode === 'help') {
    return (
      <ErrorBoundary>
        <HelpPage />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <Layout
        pdfAction={
          <PDFDownloadLink
            document={<SongPDF songs={songs} />}
            fileName="chord-sheet.pdf"
            className="flex items-center gap-3 px-8 py-3 bg-accent text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-accent-light transition-all active:scale-95 no-underline border border-white/10"
          >
            {({ loading }) => (
              <>
                <Download size={16} strokeWidth={3} />
                <span>{loading ? 'Preparing...' : 'Download PDF'}</span>
              </>
            )}
          </PDFDownloadLink>
        }
        editor={
          <div className="pb-10">
            {viewMode === 'metronome' ? (
              <Metronome />
            ) : viewMode === 'tuner' ? (
              <GuitarTuner />
            ) : (
              songs.map((song, index) => (
                <SongBlock key={song.id} song={song} index={index} />
              ))
            )}
          </div>
        }
        preview={
          <div className="w-full h-full shadow-2xl rounded-sm overflow-hidden bg-slate-900 border border-slate-700">
            <PDFViewer
              key={JSON.stringify(songs)}
              width="100%"
              height="100%"
              showToolbar={true}
            >
              <SongPDF songs={songs} />
            </PDFViewer>
          </div>
        }
      />
    </ErrorBoundary>
  );
}

export default App;
