import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const container = document.getElementById('root') as HTMLElement;

// Если пререндер уже положил HTML в #root — гидратим. Иначе — обычный render.
if (container.hasChildNodes()) {
  hydrateRoot(
    container,
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  createRoot(container).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

reportWebVitals();
