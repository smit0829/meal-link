// The Food Trust Score is MealLink's signature element: a leaf-ring gauge
// rendered anywhere a user's reliability needs to be shown at a glance.
export default function TrustBadge({ score = 50, size = 44 }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = 16;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  let color = "#357F55"; // basil-600, trustworthy
  if (clamped < 40) color = "#C4543A"; // rescue-red, low trust
  else if (clamped < 70) color = "#D6922A"; // harvest-500, building trust

  return (
    <div className="inline-flex items-center gap-2" title={`Food Trust Score: ${clamped}/100`}>
      <svg width={size} height={size} viewBox="0 0 40 40" className="shrink-0">
        <circle cx="20" cy="20" r={radius} fill="none" stroke="#F3EBDD" strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 20 20)"
        />
        <text
          x="20"
          y="23"
          textAnchor="middle"
          fontSize="11"
          fontWeight="700"
          fontFamily="Inter, sans-serif"
          fill="#0F2318"
        >
          {clamped}
        </text>
      </svg>
    </div>
  );
}
