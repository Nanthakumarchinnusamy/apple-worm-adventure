export default function Worm({
  segments = [],
  size,
  direction = { x: 1, y: 0 },
}) {
  if (!segments || segments.length === 0 || !size) return null;

  const points = segments.map(({ x, y }) => ({
    x: x + 0.5,
    y: y + 0.5,
  }));

  const head = points[0];
  const neck = points[1];

  let angle = Math.atan2(direction.y, direction.x) * (180 / Math.PI);
  if (neck) {
    angle = Math.atan2(head.y - neck.y, head.x - neck.x) * (180 / Math.PI);
  }

  const bodyPath = points
    .map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      className="pointer-events-none absolute inset-0 z-20 h-full w-full overflow-visible"
    >
      <defs>
        {/* Outlines & fill gradients matching the cartoon worm */}
        <linearGradient id="wormBodyGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#35bd08" />
          <stop offset="48%" stopColor="#289b06" />
          <stop offset="52%" stopColor="#a6ea23" />
          <stop offset="100%" stopColor="#7dc410" />
        </linearGradient>

        <filter id="shadowFilter" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="0.04" stdDeviation="0.03" floodColor="#0d3b03" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* --- 1. CONTINUOUS BODY (Green Top + Lime Belly) --- */}
      {points.length > 1 && (
        <g>
          {/* Dark outline tube */}
          <path
            d={bodyPath}
            fill="none"
            stroke="#124f05"
            strokeWidth="0.84"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Top Green Back */}
          <path
            d={bodyPath}
            fill="none"
            stroke="#2ea808"
            strokeWidth="0.74"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Bottom Lime Belly (offset stripe) */}
          <path
            d={bodyPath}
            fill="none"
            stroke="#9de21e"
            strokeWidth="0.38"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, 0.16)"
          />

          {/* Segment joint creases */}
          {points.slice(1).map((p, idx) => (
            <circle
              key={`crease-${idx}`}
              cx={p.x}
              cy={p.y}
              r="0.36"
              fill="none"
              stroke="#135206"
              strokeWidth="0.04"
              opacity="0.35"
            />
          ))}
        </g>
      )}

      {/* Single segment fallback */}
      {points.length === 1 && (
        <circle
          cx={head.x}
          cy={head.y}
          r="0.37"
          fill="#2ea808"
          stroke="#124f05"
          strokeWidth="0.05"
        />
      )}

      {/* --- 2. ELONGATED CARTOON FACE & EYES --- */}
      <g transform={`translate(${head.x} ${head.y}) rotate(${angle})`}>
        {/* Elongated Head Cap (Stretches further forward) */}
        <path
          d="M 0 -0.37 A 0.52 0.37 0 0 1 0 0.37 Z"
          fill="#2ea808"
          stroke="#124f05"
          strokeWidth="0.05"
          transform="translate(0.01, 0)"
        />

        {/* Elongated Lime underside/belly cap */}
        <path
          d="M 0 0.05 A 0.46 0.32 0 0 1 0 0.37 Z"
          fill="#9de21e"
          transform="translate(0.01, 0)"
        />

        {/* --- Back Eye (positioned along the extended forehead) --- */}
        <g transform="translate(0.12, -0.28)">
          <circle cx="0" cy="0" r="0.13" fill="#ffffff" stroke="#124f05" strokeWidth="0.025" />
          <circle cx="0.04" cy="0" r="0.055" fill="#111111" />
          <circle cx="0.06" cy="-0.02" r="0.02" fill="#ffffff" />
        </g>

        {/* --- Front Eye (forward on the extended face) --- */}
        <g transform="translate(0.28, -0.16)">
          <circle cx="0" cy="0" r="0.15" fill="#ffffff" stroke="#124f05" strokeWidth="0.028" />
          <circle cx="0.05" cy="0" r="0.065" fill="#111111" />
          <circle cx="0.07" cy="-0.02" r="0.024" fill="#ffffff" />
          <circle cx="0.03" cy="0.02" r="0.012" fill="#ffffff" />
        </g>

        {/* Rosy Cheek */}
        <ellipse
          cx="0.22"
          cy="0.12"
          rx="0.07"
          ry="0.045"
          fill="#ff5f7e"
          opacity="0.85"
        />

        {/* Friendly Mouth at the elongated tip */}
        <path
          d="M 0.36 0.04 Q 0.44 0.11 0.35 0.16"
          fill="none"
          stroke="#124f05"
          strokeWidth="0.03"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}