import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import InvoiceViewer from './pages/InvoiceViewer.tsx';
import './index.css';
import ErrorBoundary from './components/ErrorBoundary';

// Wrap the app in an ErrorBoundary so runtime errors show a friendly message
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/:id" element={<InvoiceViewer />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>
);
