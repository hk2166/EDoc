import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';
import './i18n';
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

function App() {
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [isEncryptionInitialized, setIsEncryptionInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize encryption service
  useEffect(() => {
    const initEncryption = async () => {
      try {
        console.log('Initializing encryption service...');
        await encryptionService.initialize();
        console.log('Encryption service initialized successfully');
        setIsEncryptionInitialized(true);
      } catch (error) {
        console.error('Failed to initialize encryption:', error);
        setError('Failed to initialize encryption service');
        // Still set to true to allow the app to function
        setIsEncryptionInitialized(true);
      }
    };
    
    initEncryption();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-red-600 mb-2">
            {t('common.error')}
          </h1>
          <p className="text-neutral-600">
            {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors"
          >
            {t('common.reload')}
          </button>
        </div>
      </div>
    );
  }

  if (!isEncryptionInitialized) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <Heart className="w-16 h-16 text-primary-500 mx-auto mb-4" />
          </div>
          <h1 className="text-2xl font-medium text-neutral-800 mb-2">
            {t('app.name')}
          </h1>
          <p className="text-neutral-600">
            {t('common.loading')}
          </p>
        </div>
      </div>
    );
  }

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