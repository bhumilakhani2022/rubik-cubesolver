import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import AppContent from './App';
import './App.css';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppContent />
  </StrictMode>
);
