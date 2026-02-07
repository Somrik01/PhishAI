import { NavLink, useLocation, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useContext } from "react";
import { AuthContext } from "./auth/AuthContext";

export default function Layout() {
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  return (
    <div className="layout-root">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>PhishAI</h2>

        <NavLink to="/">🔍 Scan</NavLink>
        <NavLink to="/threat-intel">🛰 Threat Intel</NavLink>
        <NavLink to="/history">🕘 History</NavLink>
        <NavLink to="/settings">⚙ Settings</NavLink>

        <button className="logout-btn" onClick={logout}>
          🚪 Logout
        </button>
      </aside>

      {/* Scrollable main area */}
      <main className="main-content">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
}
