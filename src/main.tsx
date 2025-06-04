import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';
import ErrorBoundary from './components/common/ErrorBoundary';

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceWorker.js')
      .then((registration) => {
        console.log('ServiceWorker registered with scope:', registration.scope);
      })
      .catch((error) => {
        console.error('ServiceWorker registration failed:', error);
      });
  });
}

// Render the app
const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('Root element not found');
} else {
  try {
    console.log('Starting app initialization...');
    const root = createRoot(rootElement);
    
    // Wrap the app in a try-catch to handle any initialization errors
    try {
      root.render(
        <StrictMode>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </StrictMode>
      );
      console.log('App rendered successfully');
    } catch (renderError) {
      console.error('Failed to render app:', renderError);
      // Render a fallback UI
      root.render(
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-medium text-red-600 mb-2">
              Application Error
            </h1>
            <p className="text-neutral-600">
              Failed to initialize the application. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 bg-primary-500 text-white px-4 py-2 rounded hover:bg-primary-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  } catch (error) {
    console.error('Failed to create root:', error);
  }
}