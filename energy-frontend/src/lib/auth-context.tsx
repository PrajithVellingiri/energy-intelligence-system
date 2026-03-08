import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  isAuthenticated: false,
});

const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("lastActivity");
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    if (token) {
      localStorage.setItem("lastActivity", Date.now().toString());
      inactivityTimerRef.current = setTimeout(() => {
        logout();
      }, INACTIVITY_TIMEOUT);
    }
  }, [token, logout]);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const lastActivity = localStorage.getItem("lastActivity");
    
    if (savedToken && savedUser) {
      const now = Date.now();
      const lastActivityTime = lastActivity ? parseInt(lastActivity) : now;
      
      if (now - lastActivityTime > INACTIVITY_TIMEOUT) {
        logout();
      } else {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    }
  }, [logout]);

  useEffect(() => {
    if (token) {
      resetInactivityTimer();

      const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
      events.forEach((event) => {
        window.addEventListener(event, resetInactivityTimer);
      });

      return () => {
        events.forEach((event) => {
          window.removeEventListener(event, resetInactivityTimer);
        });
        if (inactivityTimerRef.current) {
          clearTimeout(inactivityTimerRef.current);
        }
      };
    }
  }, [token, resetInactivityTimer]);

  const login = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("token", newToken);
    localStorage.setItem("user", JSON.stringify(newUser));
    localStorage.setItem("lastActivity", Date.now().toString());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
