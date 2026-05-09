import { LINES, LENGTHS, PITCH_LENGTH } from '../lib/cricket.js';

// Top-down pitch widget. Click anywhere to set line+length, or click a marker.
// Pitch drawn vertically: bowler end at top, batsman end at bottom.
const W = 160, H = 240;

export default function PitchMap({ lineKey, lengthKey, onPick }) {
  const line = LINES[lineKey];
  const length = LENGTHS[lengthKey];

  // Map world (x in [-1.6, 1.6], z in [0, PITCH_LENGTH]) → svg.
  const halfW = 1.6;
  const xToSvg = (x) => W / 2 + (x / halfW) * (W / 2 - 8);
  const zToSvg = (z) => H - 14 - (z / PITCH_LENGTH) * (H - 28);

  const handleClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * W;
    const cy = ((e.clientY - rect.top) / rect.height) * H;
    const x = ((cx - W / 2) / (W / 2 - 8)) * halfW;
    const z = ((H - 14 - cy) / (H - 28)) * PITCH_LENGTH;

    // Snap to nearest line + length.
    let bestLine = 'middle', bd = Infinity;
    for (const [k, v] of Object.entries(LINES)) {
      const d = Math.abs(v.x - x);
      if (d < bd) { bd = d; bestLine = k; }
    }
    let bestLen = 'good', ld = Infinity;
    for (const [k, v] of Object.entries(LENGTHS)) {
      const d = Math.abs(v.z - z);
      if (d < ld) { ld = d; bestLen = k; }
    }
    onPick?.(bestLine, bestLen);
  };

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="pitch-map"
      onClick={handleClick}
      role="img"
      aria-label="Pitch map"
    >
      {/* Pitch rect */}
      <rect x={W / 2 - 22} y={10} width={44} height={H - 20} fill="#c2a06a" stroke="#8a6a3a" />
      {/* Center strip */}
      <rect x={W / 2 - 8} y={20} width={16} height={H - 40} fill="#a88752" />
      {/* Length zones (horizontal bands) */}
      {Object.entries(LENGTHS).map(([k, v]) => {
        const y = zToSvg(v.z);
        return (
          <g key={k} opacity={lengthKey === k ? 1 : 0.7}>
            <line x1={W / 2 - 22} x2={W / 2 + 22} y1={y} y2={y} stroke="#5a4520" strokeDasharray="2 2" />
            <text x={W / 2 + 26} y={y + 3} fontSize="9" fill="#aaa">{v.short}</text>
          </g>
        );
      })}
      {/* Line guides (vertical) */}
      {Object.entries(LINES).map(([k, v]) => {
        const x = xToSvg(v.x);
        return (
          <line key={k} x1={x} y1={10} x2={x} y2={H - 10} stroke="#5a4520" strokeDasharray="2 2" opacity="0.4" />
        );
      })}

      {/* Stumps */}
      <rect x={W / 2 - 5} y={H - 14} width={10} height={4} fill="#fff" />
      <rect x={W / 2 - 5} y={10} width={10} height={4} fill="#fff" />
      <text x={W / 2} y={H - 2} fontSize="8" fill="#888" textAnchor="middle">Batsman</text>
      <text x={W / 2} y={8} fontSize="8" fill="#888" textAnchor="middle">Bowler</text>
      <text x={6} y={H / 2} fontSize="8" fill="#888">Leg</text>
      <text x={W - 22} y={H / 2} fontSize="8" fill="#888">Off</text>

      {/* Selected pitching spot */}
      <circle
        cx={xToSvg(line.x)}
        cy={zToSvg(length.z)}
        r="6"
        fill="#ffeb3b"
        stroke="#000"
        strokeWidth="1"
      />
    </svg>
  );
}
