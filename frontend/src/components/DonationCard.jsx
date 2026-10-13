import TrustBadge from "./TrustBadge.jsx";

const STATUS_STYLES = {
  available: "bg-basil-800/10 text-basil-800",
  requested: "bg-harvest-100 text-harvest-600",
  assigned: "bg-harvest-100 text-harvest-600",
  picked_up: "bg-basil-800/10 text-basil-800",
  delivered: "bg-basil-700 text-clay-50",
  expired: "bg-rescue-red/10 text-rescue-red",
  cancelled: "bg-basil-950/10 text-basil-950/50",
};

const STATUS_LABEL = {
  available: "Available",
  requested: "Requested",
  assigned: "Volunteer assigned",
  picked_up: "Picked up",
  delivered: "Delivered",
  expired: "Expired",
  cancelled: "Cancelled",
};

function timeUntil(dateStr) {
  const diffMs = new Date(dateStr) - new Date();
  if (diffMs <= 0) return "expired";
  const hrs = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  if (hrs >= 1) return `${hrs}h ${mins}m left`;
  return `${mins}m left`;
}

export default function DonationCard({ donation, footer }) {
  return (
    <div className="glass-panel p-6 flex flex-col gap-4 group hover:bg-white/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-lg font-semibold leading-tight">{donation.title}</h3>
          <p className="text-sm text-basil-950/60 mt-0.5 capitalize">
            {donation.foodType.replace("_", " ")} · {donation.quantity} {donation.unit}
          </p>
        </div>
        <span className={`badge ${STATUS_STYLES[donation.status]}`}>
          {STATUS_LABEL[donation.status]}
        </span>
      </div>

      {donation.description && (
        <p className="text-sm text-basil-950/70 line-clamp-2">{donation.description}</p>
      )}

      <div className="flex items-center justify-between text-xs text-basil-950/60 border-t border-basil-950/8 pt-3 mt-1">
        <span>📍 {donation.pickupAddress}</span>
        <span className="font-mono">{timeUntil(donation.expiryTime)}</span>
      </div>

      {donation.donor && (
        <div className="flex items-center gap-2">
          <TrustBadge score={donation.donor.trustScore ?? 50} size={28} />
          <span className="text-xs text-basil-950/70">
            {donation.donor.organizationName || donation.donor.name}
          </span>
        </div>
      )}

      {footer && <div className="pt-1">{footer}</div>}
    </div>
  );
}
