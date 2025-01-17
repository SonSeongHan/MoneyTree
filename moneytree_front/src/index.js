// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// (필요하다면 CSS나 reset 파일 등 import)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
