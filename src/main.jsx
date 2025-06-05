// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { NotificationProvider } from './pages/NotificationContext';
import './index.css';
import { ClerkProvider } from "@clerk/clerk-react";

const clerk_key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
console.log(clerk_key);

if(!clerk_key){
    throw new Error("Key not Found");
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
    <ClerkProvider publishableKey={clerk_key}>
      <NotificationProvider>
        <App />
      </NotificationProvider>
    </ClerkProvider>
    </BrowserRouter>
  </React.StrictMode>
);
