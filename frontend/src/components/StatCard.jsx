export default function StatCard({ label, value, accent = "basil" }) {
  const accents = {
    basil: "text-basil-800",
    harvest: "text-harvest-600",
    red: "text-rescue-red",
  };
  return (
    <div className="glass-panel px-6 py-5 group hover:bg-white/80 transition-all duration-300 hover:-translate-y-1 shadow-sm">
      <p className="text-xs uppercase tracking-wide font-semibold text-basil-950/50">{label}</p>
      <p className={`font-display text-3xl font-semibold mt-1 ${accents[accent]}`}>{value}</p>
    </div>
  );
}
