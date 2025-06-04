import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import './i18n';
import { i18nInitPromise } from './i18n';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import OfflineBanner from './components/common/OfflineBanner';
import ErrorBoundary from './components/common/ErrorBoundary';
import HomePage from './pages/HomePage';
import DiagnosisPage from './pages/DiagnosisPage';
import ResultsPage from './pages/ResultsPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';
import HistoryPage from './pages/HistoryPage';
import EmergencyPage from './pages/EmergencyPage';
import DisclaimerPage from './pages/DisclaimerPage';
import NotFoundPage from './pages/NotFoundPage';
import { AppSettingsProvider } from './contexts/AppSettingsContext';
import { DiagnosticProvider } from './contexts/DiagnosticContext';
import encryptionService from './services/encryption';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-pulse">
        <Heart className="w-16 h-16 text-primary-500 mx-auto mb-4" />
      </div>
      <h1 className="text-2xl font-medium text-neutral-800 mb-2">
        Health Edge
      </h1>
      <p className="text-neutral-600">
        Loading...
      </p>
    </div>
  </div>
);

// Error component
const ErrorScreen = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
  <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-medium text-red-600 mb-2">
        Application Error
      </h1>
      <p className="text-neutral-600 mb-4">
        {error}
      </p>
      <button
        onClick={onRetry}
        className="bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors"
      >
        Retry
      </button>
    </div>
  </div>
);

function App() {
  const { t, i18n } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [isEncryptionInitialized, setIsEncryptionInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isI18nReady, setIsI18nReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize all required services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        console.log('Starting service initialization...');
        console.log('Current state:', {
          isInitializing,
          isI18nReady,
          isEncryptionInitialized,
          i18nInitialized: i18n.isInitialized
        });
        
        // Wait for i18n initialization
        console.log('Waiting for i18n initialization...');
        await i18nInitPromise;
        console.log('i18n initialization complete');
        setIsI18nReady(true);

        // Initialize encryption
        console.log('Initializing encryption service...');
        try {
          await encryptionService.initialize();
          console.log('Encryption service initialized');
          setIsEncryptionInitialized(true);
        } catch (encryptionError) {
          console.error('Encryption initialization failed:', encryptionError);
          throw encryptionError;
        }

        console.log('All services initialized successfully');
        setIsInitializing(false);
      } catch (error) {
        console.error('Service initialization failed:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize services');
        setIsInitializing(false);
      }
    };

    initializeServices();
  }, []);

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setIsInitializing(true);
    setIsI18nReady(false);
    setIsEncryptionInitialized(false);
    window.location.reload();
  };

  // Show error screen if there's an error
  if (error) {
    return <ErrorScreen error={error} onRetry={handleRetry} />;
  }

  // Show loading screen while initializing
  if (isInitializing || !isI18nReady || !isEncryptionInitialized) {
    return <LoadingScreen />;
  }

  // Main app render
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppSettingsProvider>
          <DiagnosticProvider>
            <div className="flex flex-col min-h-screen">
              <OfflineBanner />
              <Header onOpenSettings={() => setShowSettings(true)} />
              
              <main className="flex-grow pt-16">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/diagnosis" element={<DiagnosisPage />} />
                  <Route path="/results/:sessionId?" element={<ResultsPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/history" element={<HistoryPage />} />
                  <Route path="/emergency" element={<EmergencyPage />} />
                  <Route path="/disclaimer" element={<DisclaimerPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/404" element={<NotFoundPage />} />
                  <Route path="*" element={<Navigate to="/404" replace />} />
                </Routes>
              </main>
              
              <Footer />
              
              {showSettings && (
                <SettingsPage 
                  isModal={true} 
                  onClose={() => setShowSettings(false)} 
                />
              )}
            </div>
          </DiagnosticProvider>
        </AppSettingsProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;