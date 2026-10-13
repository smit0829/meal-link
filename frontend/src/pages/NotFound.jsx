import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] grid place-items-center text-center px-5">
      <div>
        <p className="font-mono text-harvest-500 text-sm mb-2">404</p>
        <h1 className="font-display text-3xl font-semibold mb-3">This plate's empty.</h1>
        <p className="text-basil-950/60 mb-6">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">Back home</Link>
      </div>
    </div>
  );
}
