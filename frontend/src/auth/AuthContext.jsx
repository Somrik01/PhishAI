import { createContext, useContext, useState, useEffect } from "react";

/* Create Context */
export const AuthContext = createContext();

/* Provider */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    if (token) {
      fetch("http://127.0.0.1:8000/auth/me", {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setUser(data))
        .catch(() => {
  console.warn("Invalid token – logging out");
  setUser(null);
});

    }
  }, [token]);

  const login = (jwt) => {
    localStorage.setItem("token", jwt);
    setToken(jwt);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/* Hook */
export function useAuth() {
  return useContext(AuthContext);
}
