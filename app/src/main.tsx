import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { StoreProvider } from './state/StoreProvider';
import './styles/tokens.css';
import './styles/base.css';
import './styles/components.css';
import './styles/app.css';

const container = document.getElementById('root');
if (!container) throw new Error('Sparkboard could not find its mount point.');

createRoot(container).render(
  <StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </StrictMode>,
);
