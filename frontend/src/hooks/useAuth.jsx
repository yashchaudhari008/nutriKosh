import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../lib/apiClient";

const AuthContext = createContext(null);

// Temporary dev bypass: set VITE_SKIP_AUTH=true in frontend/.env to skip Google
// sign-in locally. Remove once auth needs real testing.
const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTH === "true";
const MOCK_USER = {
  _id: "000000000000000000000001",
  name: "Dev User",
  email: "dev@example.com",
  proteinGoal: 85,
  isAdmin: true,
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("nutrikosh_token"));
  const [user, setUser] = useState(SKIP_AUTH ? MOCK_USER : null);
  const [loading, setLoading] = useState(!SKIP_AUTH);

  useEffect(() => {
    if (SKIP_AUTH) return;
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
    if (SKIP_AUTH) return;
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
