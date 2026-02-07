import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./auth/AuthContext";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Layout from "./Layout";
import Scan from "./pages/Scan";
import History from "./pages/History";
import ThreatIntel from "./pages/ThreatIntel";
import Case from "./pages/Case";
import Login from "./pages/Login";
import Settings from "./pages/Settings";

function PrivateRoute() {
  const { token } = useContext(AuthContext);
  return token ? <Layout /> : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router>
      <Routes>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Protected */}
        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Scan />} />
          <Route path="/history" element={<History />} />
          <Route path="/threat-intel" element={<ThreatIntel />} />
          <Route path="/register" element={<Register />} />
          <Route path="/case/:id" element={<Case />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
