import React from 'react';
import ReactDOM from 'react-dom/client';
import './style/index.css';
import App from './App';

// Preline UI
import 'preline/preline.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);