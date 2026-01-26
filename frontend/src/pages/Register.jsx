import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register, login } from "../api/auth";

export default function Register({ onLoggedIn }) {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Create account</h1>
        <p className="text-sm text-slate-600 mt-1">Sign up in 10 seconds.</p>

        {err && <div className="mt-3 text-sm text-red-600">{err}</div>}

        <div className="mt-4 space-y-3">
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Username"
            value={username} onChange={(e) => setUsername(e.target.value)} />
          <input className="w-full border rounded-xl px-3 py-2" placeholder="Password (min 6 chars)" type="password"
            value={password} onChange={(e) => setPassword(e.target.value)} />

          <button
            className="w-full rounded-xl px-3 py-2 bg-slate-900 text-white hover:bg-slate-800"
            onClick={async () => {
              try {
                setErr("");
                await register(username, password);
                await login(username, password);
                await onLoggedIn();
                nav("/tickets");
              } catch {
                setErr("Signup failed. Username may already exist.");
              }
            }}
          >
            Create account
          </button>

          <p className="text-sm text-slate-600">
            Have an account? <Link className="underline" to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
