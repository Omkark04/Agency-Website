import React from "react";
import ReactDOM from "react-dom/client";
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
    <AppWrapper />
  </React.StrictMode>
);
