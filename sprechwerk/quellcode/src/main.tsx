import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { setupWebApp } from './lib/install';
import './index.css';

document.documentElement.lang = 'de';
setupWebApp();

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
