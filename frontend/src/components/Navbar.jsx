import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import TrustBadge from "./TrustBadge.jsx";

const DASHBOARD_PATH = {
  donor: "/donor",
  ngo: "/ngo",
  volunteer: "/volunteer",
  admin: "/admin",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="border-b border-white/40 bg-white/60 backdrop-blur-xl shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-basil-800 grid place-items-center text-clay-50 font-display text-sm">
            ML
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">MealLink</span>
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to={DASHBOARD_PATH[user.role]}
                className="text-sm font-medium text-basil-900 hover:text-basil-700"
              >
                Dashboard
              </Link>
              <div className="hidden sm:flex items-center gap-2 pl-2">
                <TrustBadge score={user.trustScore ?? 50} size={32} />
                <span className="text-sm text-basil-900/80">{user.name}</span>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="btn-secondary !px-4 !py-1.5 text-sm"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium text-basil-900 hover:text-basil-700">
                Log in
              </Link>
              <Link to="/register" className="btn-primary !px-4 !py-1.5 text-sm">
                Join MealLink
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
