import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AppPublico from './AppPublico';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter limpo, nativo e profissional para Cloudflare */}
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppPublico />} />
        <Route path="/admin/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);