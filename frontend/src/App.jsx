import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Tickets from "./pages/Tickets";
import TicketDetail from "./pages/TicketDetail";
import AdminDashboard from "./pages/AdminDashboard";
import NavBar from "./components/NavBar";
import { me } from "./api/auth";

function RequireAuth({ user, children }) {
  const loc = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: loc }} replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function loadUser() {
    try {
      const u = await me();
      setUser(u);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUser(); }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen">
      {user && <NavBar user={user} />}

      <Routes>
        <Route path="/" element={<Navigate to="/tickets" />} />
        <Route path="/login" element={<Login onLoggedIn={loadUser} />} />
        <Route path="/register" element={<Register onLoggedIn={loadUser} />} />

        <Route path="/tickets" element={<RequireAuth user={user}><Tickets /></RequireAuth>} />
        <Route path="/tickets/:id" element={<RequireAuth user={user}><TicketDetail user={user} /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth user={user}>{user?.is_staff ? <AdminDashboard /> : <Navigate to="/tickets" />}</RequireAuth>} />

        <Route path="*" element={<Navigate to="/tickets" />} />
      </Routes>
    </div>
  );
}
