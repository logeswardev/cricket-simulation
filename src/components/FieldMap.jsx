import { useRef, useState } from 'react';
import { BOUNDARY_R, INNER_CIRCLE_R, PITCH_LENGTH } from '../lib/cricket.js';

// Top-down field editor. World coords: x = off side (+), z = toward bowler (+).
// SVG: we map world (x, z) → svg (cx, cy) with z flipped so bowler end is at the top.
const SVG_SIZE = 360;
const VIEW_R = BOUNDARY_R + 8; // padding inside viewbox
const SCALE = SVG_SIZE / 2 / VIEW_R;
const CENTER = SVG_SIZE / 2;

function worldToSvg(x, z) {
  // Center the pitch in the viewbox: shift so middle of pitch (z = PITCH_LENGTH/2) maps to svg center.
  const cx = CENTER + x * SCALE;
  const cy = CENTER - (z - PITCH_LENGTH / 2) * SCALE;
  return { cx, cy };
}

function svgToWorld(cx, cy) {
  const x = (cx - CENTER) / SCALE;
  const z = (CENTER - cy) / SCALE + PITCH_LENGTH / 2;
  return { x, z };
}

export default function FieldMap({ fielders, onMove, selectedId, onSelect }) {
  const svgRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const onPointerDown = (e, f) => {
    e.stopPropagation();
    onSelect?.(f.id);
    setDragging(f.id);
    svgRef.current?.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragging || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const cx = ((e.clientX - rect.left) / rect.width) * SVG_SIZE;
    const cy = ((e.clientY - rect.top) / rect.height) * SVG_SIZE;
    const { x, z } = svgToWorld(cx, cy);
    // Clamp inside boundary.
    const dx = x;
    const dz = z - PITCH_LENGTH / 2;
    const r = Math.hypot(dx, dz);
    let nx = x, nz = z;
    if (r > BOUNDARY_R - 1) {
      const k = (BOUNDARY_R - 1) / r;
      nx = dx * k;
      nz = dz * k + PITCH_LENGTH / 2;
    }
    onMove?.(dragging, nx, nz);
  };

  const onPointerUp = (e) => {
    setDragging(null);
    try { svgRef.current?.releasePointerCapture(e.pointerId); } catch { /* noop */ }
  };

  const pitchTop = worldToSvg(0, PITCH_LENGTH);
  const pitchBot = worldToSvg(0, 0);
  const innerCircle = worldToSvg(0, PITCH_LENGTH / 2);

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SVG_SIZE} ${SVG_SIZE}`}
      className="field-map"
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      {/* Outfield */}
      <circle cx={innerCircle.cx} cy={innerCircle.cy} r={BOUNDARY_R * SCALE} fill="#1f5e2a" stroke="#ffffff" strokeWidth="1.5" />
      {/* Inner circle */}
      <circle cx={innerCircle.cx} cy={innerCircle.cy} r={INNER_CIRCLE_R * SCALE} fill="none" stroke="#ffffff" strokeOpacity="0.55" strokeDasharray="4 3" strokeWidth="1" />
      {/* Pitch */}
      <line
        x1={pitchBot.cx} y1={pitchBot.cy}
        x2={pitchTop.cx} y2={pitchTop.cy}
        stroke="#c2a06a" strokeWidth={3.05 * SCALE} strokeLinecap="butt"
      />
      {/* Striker / bowler markers */}
      <circle cx={pitchBot.cx} cy={pitchBot.cy} r="4" fill="#e53935" />
      <circle cx={pitchTop.cx} cy={pitchTop.cy} r="4" fill="#1e88e5" />
      <text x={pitchBot.cx + 6} y={pitchBot.cy + 4} fontSize="9" fill="#fff">Batsman</text>
      <text x={pitchTop.cx + 6} y={pitchTop.cy + 4} fontSize="9" fill="#fff">Bowler</text>

      {/* Off / Leg labels */}
      <text x={SVG_SIZE - 28} y={CENTER + 4} fontSize="10" fill="#aaa">Off →</text>
      <text x={6} y={CENTER + 4} fontSize="10" fill="#aaa">← Leg</text>

      {/* Fielders */}
      {fielders.map((f) => {
        const { cx, cy } = worldToSvg(f.x, f.z);
        const sel = selectedId === f.id;
        return (
          <g
            key={f.id}
            transform={`translate(${cx}, ${cy})`}
            style={{ cursor: 'grab' }}
            onPointerDown={(e) => onPointerDown(e, f)}
          >
            <circle r="9" fill={sel ? '#ffeb3b' : '#4fc3f7'} stroke="#000" strokeWidth="1" />
            <text textAnchor="middle" y="3" fontSize="9" fontWeight="700" fill="#000">
              {f.name.split(' ').map(w => w[0]).join('').slice(0, 3)}
            </text>
            <text textAnchor="middle" y="22" fontSize="9" fill="#fff" stroke="#000" strokeWidth="0.3">
              {f.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
