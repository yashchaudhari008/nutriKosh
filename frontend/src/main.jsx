import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import App from "./App";
import { AuthProvider } from "./hooks/useAuth";
import { SyncProvider } from "./hooks/useSync";
import "./index.css";

const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTH === "true";
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const AppWrapper = () => (
  <HashRouter>
    <AuthProvider>
      <SyncProvider>
        <App />
      </SyncProvider>
    </AuthProvider>
  </HashRouter>
);

const root = SKIP_AUTH ? (
  <React.StrictMode>
    <AppWrapper />
  </React.StrictMode>
) : (
  <React.StrictMode>
    <GoogleOAuthProvider clientId={clientId}>
      <AppWrapper />
    </GoogleOAuthProvider>
  </React.StrictMode>
);

ReactDOM.createRoot(document.getElementById("root")).render(root);
