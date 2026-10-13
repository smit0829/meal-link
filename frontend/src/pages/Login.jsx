import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const DASHBOARD_PATH = { donor: "/donor", ngo: "/ngo", volunteer: "/volunteer", admin: "/admin" };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      // Timeout necessary to avoid context transition race condition unmounting the tree prior to flush
      setTimeout(() => {
        navigate(DASHBOARD_PATH[user.role] || "/");
      }, 50);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't log in. Check your details.");
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] relative grid place-items-center px-5">
      <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-harvest-400/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[20%] right-[20%] w-72 h-72 bg-basil-600/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-sm relative z-10">
        <h1 className="font-display text-4xl font-bold text-center mb-2 text-basil-950">Welcome back</h1>
        <p className="text-center text-basil-950/60 text-sm mb-8 font-medium">Log in to your MealLink account</p>

        <form onSubmit={submit} className="glass-panel p-8 flex flex-col gap-5">
          {error && (
            <p className="text-sm text-rescue-red font-medium bg-rescue-red/10 rounded-xl px-4 py-3 border border-rescue-red/20">{error}</p>
          )}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              required
              className="input transition-transform hover:-translate-y-0.5"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              required
              className="input transition-transform hover:-translate-y-0.5"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn-primary mt-4 py-3" disabled={busy}>
            {busy ? "Logging in…" : "Log in to Dashboard"}
          </button>
        </form>

        <p className="text-center text-sm text-basil-950/60 mt-8 font-medium">
          New to MealLink?{" "}
          <Link to="/register" className="text-basil-800 font-bold hover:underline decoration-2 underline-offset-4">
            Create an account
          </Link>
        </p>

        <div className="mt-8 text-[11px] text-basil-950/50 text-center leading-relaxed font-mono bg-white/40 p-4 rounded-xl border border-white/50 backdrop-blur-sm">
          Demo accounts:<br />
          donor@meallink.com / donor123<br />
          ngo@meallink.com / ngo123<br />
          volunteer@meallink.com / volunteer123<br />
          admin@meallink.com / admin123
        </div>
      </div>
    </div>
  );
}
