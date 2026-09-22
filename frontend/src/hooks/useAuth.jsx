import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("nutrikosh_token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    apiFetch("/api/me", { token })
      .then(setUser)
      .catch(() => {
        setToken(null);
        localStorage.removeItem("nutrikosh_token");
      })
      .finally(() => setLoading(false));
  }, [token]);

  async function loginWithGoogleIdToken(idToken) {
    const { token: sessionToken, user: loggedInUser } = await apiFetch("/api/auth/google", {
      method: "POST",
      body: { idToken },
    });
    localStorage.setItem("nutrikosh_token", sessionToken);
    setToken(sessionToken);
    setUser(loggedInUser);
  }

  function logout() {
    localStorage.removeItem("nutrikosh_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, loginWithGoogleIdToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
