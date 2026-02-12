import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App.tsx';
import InvoiceViewer from './pages/InvoiceViewer.tsx';
import './index.css';

// Do not set a Router basename by default — this avoids deployment mismatches
// caused by an incorrect `VITE_BASE_PATH` environment variable.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/:id" element={<InvoiceViewer />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
