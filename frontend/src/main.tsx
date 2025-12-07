import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "./index.css";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

// Create a wrapper component that conditionally renders GoogleOAuthProvider
const AppWrapper = () => {
  if (!clientId) {
    console.warn('Google OAuth client ID is not set. Google authentication will not work.');
    return <App />;
  }
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <App />
    </GoogleOAuthProvider>
  );
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
);
