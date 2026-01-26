import { Link, useNavigate } from "react-router-dom";
import { logout } from "../api/auth";

export default function NavBar({ user }) {
  const nav = useNavigate();

  return (
    <div className="w-full bg-white border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/tickets" className="font-semibold text-lg">AI Support Desk</Link>

        <div className="flex items-center gap-4">
          {user?.is_staff && (
            <Link to="/admin" className="text-sm font-medium text-slate-700 hover:text-slate-900">
              Admin Dashboard
            </Link>
          )}

          <div className="text-sm text-slate-600">{user ? `@${user.username}` : ""}</div>

          <button
            className="text-sm px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
            onClick={() => { logout(); nav("/login"); }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
