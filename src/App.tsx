import React from 'react';
import { Layout } from './components/Layout';
import { useSongStore } from './store/useSongStore';
import { PDFViewer, PDFDownloadLink } from '@react-pdf/renderer';
import { SongPDF } from './components/SongPDF';
import { SongBlock } from './components/SongBlock';
import { EditorOptionsPanel } from './components/EditorOptionsPanel';
import { Metronome } from './components/Metronome';
import { Download } from 'lucide-react';

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

  return (
    <ErrorBoundary>
      <Layout
        headerActions={
          <PDFDownloadLink
            document={<SongPDF songs={songs} />}
            fileName="chord-sheet.pdf"
            className="ios-btn flex items-center gap-2 decoration-0 no-underline"
          >
            {({ loading }) => (
              <>
                <Download size={16} />
                <span>{loading ? 'Generating...' : 'Download PDF'}</span>
              </>
            )}
          </PDFDownloadLink>
        }
        editor={
          <div className="space-y-8 pb-10">
            <EditorOptionsPanel />
            {viewMode === 'metronome' ? (
              <Metronome />
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
