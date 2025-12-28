import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import App from "./App";
import "./index.css";
import { initGA } from "./utils/analytics";

// Initialize Google Analytics
initGA();

// Create a wrapper component that conditionally renders GoogleOAuthProvider
const AppWrapper = () => {
  
  return (
    <App />
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AppWrapper />
    </HelmetProvider>
  </React.StrictMode>
);
