import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const DASHBOARD_PATH = { donor: "/donor", ngo: "/ngo", volunteer: "/volunteer" };

const ROLE_COPY = {
  donor: "Post surplus food from your restaurant, hotel, hall or event.",
  ngo: "Discover and request donations for your shelter or community fridge.",
  volunteer: "Accept pickup tasks and deliver food where it's needed.",
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "donor",
    name: "",
    email: "",
    password: "",
    donorType: "restaurant",
    organizationName: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const user = await register(form);
      setTimeout(() => {
        navigate(DASHBOARD_PATH[user.role] || "/");
      }, 50);
    } catch (err) {
      if (err.response) {
        setError(err.response.data?.message || "Couldn't create your account.");
      } else {
        setError(err.message || "Network Error: Couldn't connect to server.");
      }
      setBusy(false);
    }
  };

  return (
    <div className="min-h-[80vh] px-5 py-14 grid place-items-center relative">
      <div className="absolute top-[10%] left-[10%] w-[30rem] h-[30rem] bg-harvest-400/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-basil-600/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-lg relative z-10">
        <h1 className="font-display text-4xl font-bold text-center mb-2 text-basil-950">Join MealLink</h1>
        <p className="text-center text-basil-950/60 text-[15px] font-medium mb-8">
          Every account starts here — choose the role that fits.
        </p>

        <div className="grid grid-cols-3 gap-3 mb-6">
          {Object.keys(ROLE_COPY).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm({ ...form, role: r })}
              className={`rounded-2xl border-2 px-4 py-4 text-sm font-bold capitalize transition-all duration-300 shadow-sm ${form.role === r
                ? "border-basil-800 bg-gradient-to-br from-basil-900 to-basil-700 text-clay-50 shadow-glow -translate-y-1"
                : "border-basil-950/10 bg-white/60 backdrop-blur-sm text-basil-950/70 hover:border-basil-800/40 hover:bg-white/90 hover:-translate-y-0.5"
                }`}
            >
              {r === "ngo" ? "NGO / Shelter" : r}
            </button>
          ))}
        </div>

        <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/50 p-4 mb-6 shadow-sm">
          <p className="text-sm font-medium text-basil-900 text-center">{ROLE_COPY[form.role]}</p>
        </div>

        <form onSubmit={submit} className="glass-panel p-8 flex flex-col gap-5">
          {error && (
            <p className="text-sm text-rescue-red font-medium bg-rescue-red/10 rounded-xl px-4 py-3 border border-rescue-red/20">{error}</p>
          )}

          <div>
            <label className="label">{form.role === "ngo" ? "Contact person name" : "Full name"}</label>
            <input
              required
              className="input transition-transform hover:-translate-y-0.5"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          {form.role === "donor" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="label">Establishment type</label>
              <select
                className="input transition-transform hover:-translate-y-0.5"
                value={form.donorType}
                onChange={(e) => setForm({ ...form, donorType: e.target.value })}
              >
                <option value="restaurant">Restaurant</option>
                <option value="hotel">Hotel</option>
                <option value="marriage_hall">Marriage hall</option>
                <option value="hostel">Hostel</option>
                <option value="event_organizer">Event organizer</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {form.role === "ngo" && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="label">Organization name</label>
              <input
                required
                className="input transition-transform hover:-translate-y-0.5"
                value={form.organizationName}
                onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
              />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-5">
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
                minLength={6}
                className="input transition-transform hover:-translate-y-0.5"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-[1fr_2fr] gap-5">
            <div>
              <label className="label">Phone</label>
              <input
                className="input transition-transform hover:-translate-y-0.5"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Address</label>
              <input
                className="input transition-transform hover:-translate-y-0.5"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
          </div>

          {form.role === "ngo" && (
            <div className="mt-2 text-[13px] font-medium text-harvest-600 bg-gradient-to-r from-harvest-50 to-white/50 border border-harvest-200/50 rounded-xl px-4 py-3 flex items-start gap-3">
              <div className="mt-0.5 border border-harvest-400 text-harvest-600 rounded-full w-4 h-4 flex items-center justify-center text-[10px] shrink-0 font-bold">i</div>
              NGO/shelter accounts need admin verification before requesting donations.
            </div>
          )}

          <button className="btn-primary mt-4 py-3.5" disabled={busy}>
            {busy ? "Creating account…" : "Create account & View Dashboard"}
          </button>
        </form>

        <p className="text-center text-[15px] font-medium text-basil-950/60 mt-8">
          Already on MealLink?{" "}
          <Link to="/login" className="text-basil-800 font-bold hover:underline decoration-2 underline-offset-4">
            Log in instead
          </Link>
        </p>
      </div>
    </div>
  );
}
