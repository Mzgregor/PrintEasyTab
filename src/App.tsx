import React, { useEffect } from 'react';
import { useSongStore } from './store/useSongStore';
import { Layout } from './components/Layout';
import { SongPDF } from './components/SongPDF';
import { SongBlock } from './components/SongBlock';
import { Metronome } from './components/Metronome';
import { Download, X, Plus } from 'lucide-react';
import { GuitarTuner } from './components/GuitarTuner';
import { HelpPage } from './components/HelpPage';
import { LoginPage } from './components/LoginPage';
import { RegistrationPage } from './components/RegistrationPage';
import { AdminPanel } from './components/AdminPanel';
import { SettingsPage } from './components/SettingsPage';
import { AccountActivationPage } from './components/AccountActivationPage';
import { ConfirmationModal } from './components/ConfirmationModal';
import { LibraryView } from './components/LibraryView';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { WelcomeScreen } from './components/WelcomeScreen';

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
  const songs = useSongStore((state: any) => state.songs);
  const activeSongId = useSongStore((state: any) => state.activeSongId);
  const viewMode = useSongStore((state: any) => state.viewMode);
  const isAuthenticated = useSongStore((state: any) => state.isAuthenticated);
  const setViewMode = useSongStore((state: any) => state.setViewMode);

  const addSong = useSongStore((state: any) => state.addSong);
  const removeSong = useSongStore((state: any) => state.removeSong);
  const setActiveSongId = useSongStore((state: any) => state.setActiveSongId);

  const [songToDelete, setSongToDelete] = React.useState<string | null>(null);

  const activeSong = songs.find((s: any) => s.id === activeSongId) || (songs.length > 0 ? songs[0] : null);

  // Check for activation token in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const activateToken = urlParams.get('activate');

    if (activateToken) {
      setViewMode('auth'); // This will trigger the activation page
    }
  }, [setViewMode]);

  // Handle activation page
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('activate')) {
    return (
      <ErrorBoundary>
        <AccountActivationPage />
      </ErrorBoundary>
    );
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        {viewMode === 'register' ? <RegistrationPage /> : <LoginPage />}
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

  if (viewMode === 'settings') {
    return (
      <ErrorBoundary>
        <SettingsPage />
      </ErrorBoundary>
    );
  }

  if (viewMode === 'admin') {
    return (
      <ErrorBoundary>
        <AdminPanel />
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
            className="btn-glossy-blue px-8 py-3 text-xs uppercase tracking-[0.2em]"
          >
            {({ loading }) => (
              <>
                <Download size={16} strokeWidth={3} />
                <span>{loading ? 'Preparing...' : 'Export PDF'}</span>
              </>
            )}
          </PDFDownloadLink>
        }
        editor={
          <div className="pb-10 max-w-[95%] mx-auto">
            {viewMode === 'metronome' ? (
              <Metronome />
            ) : viewMode === 'tuner' ? (
              <GuitarTuner />
            ) : viewMode === 'library' ? (
              <LibraryView />
            ) : songs.length === 0 ? (
              <WelcomeScreen onCreateTab={addSong} />
            ) : (
              <div className="space-y-4">
                {/* Browser-style Song Tabs - Relocated to Editor Area */}
                <div className="song-tabs-container mb-2 bg-transparent">
                  {songs.map((song: any, index: number) => (
                    <div
                      key={song.id}
                      onClick={() => setActiveSongId(song.id)}
                      className={`song-tab ${activeSongId === song.id ? 'song-tab-active' : ''}`}
                    >
                      <span className="song-tab-title">
                        {song.title || `Song #${index + 1}`}
                      </span>
                      {songs.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSongToDelete(song.id);
                          }}
                          className="song-tab-close"
                        >
                          <X size={16} strokeWidth={2.5} />
                        </button>
                      )}
                    </div>
                  ))}

                  {songs.length < 4 && (
                    <button
                      onClick={addSong}
                      className="add-tab-btn"
                      title="Nouvel onglet"
                    >
                      <Plus size={18} />
                    </button>
                  )}
                </div>

                {activeSong && <SongBlock song={activeSong} />}
              </div>
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

      <ConfirmationModal
        isOpen={!!songToDelete}
        title={songs.find((s: any) => s.id === songToDelete)?.title ? `Quitter la chanson "${songs.find((s: any) => s.id === songToDelete).title}" ?` : "Quitter la chanson ?"}
        message="Voulez-vous vraiment quitter cet onglet ? Assurez-vous d'avoir sauvegardé vos modifications si nécessaire."
        confirmText="Quitter"
        cancelText="Annuler"
        variant="warning"
        onConfirm={() => {
          if (songToDelete) {
            removeSong(songToDelete);
            setSongToDelete(null);
          }
        }}
        onCancel={() => setSongToDelete(null)}
      />
    </ErrorBoundary>
  );
}

export default App;
