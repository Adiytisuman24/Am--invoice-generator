import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import InvoiceViewer from './pages/InvoiceViewer.tsx';
import './index.css';

// Use a configurable base path in production via `VITE_BASE_PATH` (falls back to '/')
// This keeps local dev working while allowing deployments under a subpath.
const BASE_PATH = import.meta.env.PROD ? (import.meta.env.VITE_BASE_PATH ?? '/') : '/';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={BASE_PATH}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/:id" element={<InvoiceViewer />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
