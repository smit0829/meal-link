import { Link } from "react-router-dom";
import TrustBadge from "../components/TrustBadge.jsx";

const STEPS = [
  {
    n: "01",
    title: "Surplus gets posted",
    body: "Restaurants, hotels, marriage halls, hostels and event organizers list food that's still safe to eat — quantity, type, and the window it's good until.",
  },
  {
    n: "02",
    title: "An NGO claims it",
    body: "Verified shelters, NGOs and community fridges browse by location and expiry, and request what they can use.",
  },
  {
    n: "03",
    title: "A volunteer bridges the gap",
    body: "A nearby volunteer accepts the pickup, collects from the donor, and marks each leg of the journey in real time.",
  },
  {
    n: "04",
    title: "Trust compounds",
    body: "Every completed handoff — on time, good quality, well communicated — feeds the Food Trust Score for everyone involved.",
  },
];

export default function Home() {
  return (
    <div className="relative overflow-hidden w-full">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-harvest-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob" />
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-basil-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-rescue-red/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000" />

      {/* Hero */}
      <section className="relative z-10 max-w-6xl mx-auto px-5 pt-20 pb-28 grid lg:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
        <div className="relative">
          <span className="badge bg-gradient-to-r from-harvest-100 to-harvest-50 text-harvest-600 border border-harvest-400/20 shadow-sm mb-6 inline-flex">
            Food rescue network
          </span>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight text-basil-950 mb-8 drop-shadow-sm">
            Surplus food has<br />
            an expiry window.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-basil-800 to-basil-600">
              So does hunger.
            </span>
          </h1>
          <p className="mt-2 text-basil-950/70 text-lg max-w-md leading-relaxed">
            MealLink connects kitchens with too much food to the people and
            organizations who can use it — before it's too late, with a trust
            score that keeps everyone accountable.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary text-lg px-8 py-3.5 shadow-glow">
              Start rescuing food
            </Link>
            <Link to="/login" className="btn-secondary text-lg px-8 py-3.5 bg-white/50 backdrop-blur-sm">
              I have an account
            </Link>
          </div>
        </div>

        {/* Signature element: a live-feeling "handoff" card stack showing the chain */}
        <div className="relative perspective-1000 hidden sm:block">
          <div className="glass-panel p-6 transform rotate-[-4deg] translate-y-4 translate-x-4 absolute top-0 left-0 w-full opacity-40 shadow-xl" />
          <div className="glass-panel p-6 transform rotate-[2deg] translate-y-2 translate-x-2 absolute top-0 left-0 w-full opacity-70 shadow-xl" />
          <div className="glass-panel p-8 relative transform transition-transform duration-500 hover:scale-105 hover:-rotate-1 shadow-glow border-white/50 bg-white/70">
            <div className="flex items-center justify-between mb-6">
              <span className="badge bg-gradient-to-r from-basil-800/10 to-basil-600/10 text-basil-800 border-basil-800/20">Active Handoff</span>
              <span className="font-mono text-sm font-bold text-basil-950/50 flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-harvest-500" />
                42m left
              </span>
            </div>
            <h3 className="font-display text-2xl font-semibold mb-2">Vegetable biryani, 60 servings</h3>
            <p className="text-sm font-medium text-basil-950/60 mb-6 flex items-center gap-2">
              <span className="px-2 py-1 bg-white/60 rounded-md border border-black/5">Green Leaf</span>
              <span className="text-basil-600/50">→</span>
              <span className="px-2 py-1 bg-white/60 rounded-md border border-black/5">Hope Shelter</span>
            </p>
            <div className="flex items-center justify-between border-t border-basil-950/10 pt-5 mt-2">
              <div className="flex items-center gap-3">
                <TrustBadge score={82} size={42} />
                <span className="text-xs font-bold uppercase tracking-wider text-basil-950/50">Donor<br />Trust</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-right text-basil-950/50">Volunteer<br />Trust</span>
                <TrustBadge score={91} size={42} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative z-10 bg-basil-950 text-clay-50 py-24 rounded-t-[3rem] shadow-glow">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl sm:text-5xl font-semibold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-clay-50 to-harvest-100">How a rescue happens</h2>
            <p className="text-clay-50/70 max-w-lg mx-auto text-lg">
              Four handoffs, one chain of custody, tracked end to end.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="p-6 relative z-10 border border-white/5 rounded-2xl hover:border-white/20 transition-colors">
                  <span className="inline-flex w-12 h-12 items-center justify-center rounded-full bg-harvest-400/10 text-harvest-400 font-mono text-lg font-bold mb-5 shadow-[0_0_15px_rgba(232,169,59,0.2)]">
                    {s.n}
                  </span>
                  <h3 className="font-display text-xl font-semibold mb-3">{s.title}</h3>
                  <p className="text-sm text-clay-50/70 leading-relaxed">{s.body}</p>
                </div>
                {i !== STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-[45px] right-[-30px] w-[60px] h-[2px] bg-gradient-to-r from-harvest-400/20 to-transparent z-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="relative z-10 bg-clay-50 max-w-6xl mx-auto px-5 py-24">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-semibold mb-4 text-basil-950">Built for every stakeholder</h2>
          <p className="text-basil-950/60 max-w-lg mx-auto text-lg">One platform, four roles, each with its own dashboard.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { role: "Donor", icon: "🏢", body: "Post surplus in minutes, track pickup status, build a reputation for reliable giving." },
            { role: "NGO / Shelter", icon: "🤝", body: "Discover donations by location and expiry, request what fits your capacity." },
            { role: "Volunteer", icon: "🚲", body: "Accept nearby pickups, log each step, earn trust with every delivery." },
            { role: "Admin", icon: "🛡️", body: "Verify organizations, monitor the network, and see impact in real numbers." },
          ].map((r) => (
            <div key={r.role} className="glass-panel p-6 group hover:bg-white/90 transition-all duration-300 hover:-translate-y-2 border-white/50">
              <div className="text-3xl mb-4 transform group-hover:scale-110 transition-transform origin-bottom-left">{r.icon}</div>
              <h3 className="font-display text-xl font-bold text-basil-800 mb-2">{r.role}</h3>
              <p className="text-sm text-basil-900/70 leading-relaxed font-medium">{r.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 max-w-5xl mx-auto px-5 pb-28">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-harvest-50 via-white to-harvest-100 border border-harvest-200/50 p-12 sm:p-16 text-center shadow-glow">
          <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-harvest-400/20 rounded-full blur-3xl mix-blend-multiply" />
          <div className="absolute bottom-[-50%] left-[-10%] w-64 h-64 bg-basil-500/10 rounded-full blur-3xl mix-blend-multiply" />

          <div className="relative z-10">
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-basil-950 leading-tight mb-8">
              Every plate saved <br />
              <span className="text-harvest-600">is a plate served.</span>
            </h2>
            <Link to="/register" className="btn-primary text-lg px-10 py-4 shadow-xl shadow-basil-700/20">
              Join the network today
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
