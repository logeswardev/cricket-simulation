// Simple ball-by-ball simulation engine.
// For each delivery: pick a shot zone from the batsman profile (biased by the
// bowler's line+length), sample an angle inside that zone, sample power & loft,
// project the ball trajectory, then check fielders for stops / catches.

import { SHOT_ZONES, BOUNDARY_R, INNER_CIRCLE_R, LINES, LENGTHS, PITCH_LENGTH } from './cricket.js';

const deg2rad = (d) => (d * Math.PI) / 180;

// Combine batsman profile probabilities with line+length zone bias multipliers,
// then renormalize so they sum to 1.
function biasedZoneProbs(profile, lineKey, lengthKey) {
  const line = LINES[lineKey] ?? LINES.middle;
  const len = LENGTHS[lengthKey] ?? LENGTHS.good;
  const out = {};
  let total = 0;
  for (const z of SHOT_ZONES) {
    const base = profile.zoneProbs[z.id] ?? 0;
    const lb = line.zoneBias[z.id] ?? 1;
    const ln = len.zoneBias[z.id] ?? 1;
    const v = base * lb * ln;
    out[z.id] = v;
    total += v;
  }
  if (total <= 0) return profile.zoneProbs;
  for (const k of Object.keys(out)) out[k] /= total;
  return out;
}

function pickZone(probs, rng) {
  const r = rng();
  let acc = 0;
  for (const z of SHOT_ZONES) {
    acc += probs[z.id] ?? 0;
    if (r <= acc) return z;
  }
  return SHOT_ZONES[0];
}

function sampleAngle(zone, rng) {
  const a = zone.start + rng() * (zone.end - zone.start);
  return deg2rad(a);
}

function angleToDir(angle) {
  return { dx: Math.sin(angle), dz: Math.cos(angle) };
}

function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

function sampleShot(profile, length, rng) {
  const power = clamp(profile.power + length.powerMod + (rng() - 0.5) * 0.32, 0.05, 1.15);
  const loftP = clamp(profile.loftProb + length.loftMod, 0, 0.95);
  const lofted = rng() < loftP;
  const baseDist = 12 + power * 70 + (rng() - 0.5) * 12;
  const distance = Math.max(3, baseDist);
  const apex = lofted ? 4 + power * 16 + rng() * 4 : 0.6 + rng() * 0.8;
  return { distance, apex, lofted, power };
}

function pointToSegmentDist(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az;
  const lenSq = dx * dx + dz * dz;
  if (lenSq === 0) return { dist: Math.hypot(px - ax, pz - az), t: 0 };
  let t = ((px - ax) * dx + (pz - az) * dz) / lenSq;
  t = clamp(t, 0, 1);
  const cx = ax + t * dx, cz = az + t * dz;
  return { dist: Math.hypot(px - cx, pz - cz), t };
}

// Simulate a single delivery. `deliveryPick` may include lineKey & lengthKey.
export function simulateBall(profile, fielders, deliveryPick = {}, rng = Math.random) {
  const lineKey = deliveryPick.lineKey ?? 'good_off_default';
  const lengthKey = deliveryPick.lengthKey ?? 'good';
  const line = LINES[lineKey] ?? LINES.off;
  const length = LENGTHS[lengthKey] ?? LENGTHS.good;

  // Pre-shot wicket chance (e.g. yorker bowled, bouncer top-edge to keeper).
  const preWicketRoll = rng();
  const dotRoll = rng();

  const probs = biasedZoneProbs(profile, lineKey, lengthKey);
  const zone = pickZone(probs, rng);
  const angle = sampleAngle(zone, rng);
  const { distance, apex, lofted, power } = sampleShot(profile, length, rng);
  const dir = angleToDir(angle);

  const startX = 0, startZ = 0;
  const endX = startX + dir.dx * distance;
  const endZ = startZ + dir.dz * distance;

  const groundSpeed = 18 + power * 12;
  const flightTime = lofted ? Math.sqrt((2 * apex) / 9.81) * 2 : distance / groundSpeed;

  // Pitching point (where the ball bounces).
  const pitchPoint = { x: line.x, z: length.z };

  // Pre-shot wicket (clean bowled / lbw / edged behind).
  if (preWicketRoll < (length.wicketBias ?? 0)) {
    return {
      lineKey, lengthKey, lineName: line.name, lengthName: length.name,
      pitchPoint,
      zone: zone.id, zoneName: zone.name, angle,
      startXZ: [startX, startZ],
      endXZ: [startX, startZ + 0.6],
      apex: 0, lofted: false, distance: 0,
      flightTime: 0.2,
      runs: 0, wicket: true,
      outcome: lengthKey === 'yorker' ? 'BOWLED!' : lengthKey === 'bouncer' ? 'Caught behind!' : 'LBW!',
      interceptedBy: null,
      didShot: false,
    };
  }

  // Yorker / good ball pre-shot dot (defensive block).
  if (dotRoll < (length.dotBias ?? 0)) {
    return {
      lineKey, lengthKey, lineName: line.name, lengthName: length.name,
      pitchPoint,
      zone: zone.id, zoneName: zone.name, angle,
      startXZ: [startX, startZ],
      endXZ: [dir.dx * 4, dir.dz * 4],
      apex: 0.3, lofted: false, distance: 4,
      flightTime: 0.5,
      runs: 0, wicket: false,
      outcome: 'Defended — dot ball',
      interceptedBy: null,
      didShot: true,
    };
  }

  // Find best fielder intercept along the segment.
  let best = null;
  for (const f of fielders) {
    const r = pointToSegmentDist(f.x, f.z, startX, startZ, endX, endZ);
    const reach = Math.max(2.5, flightTime * 6 - 1.5);
    if (r.dist <= reach) {
      const score = r.dist + (1 - r.t) * 2;
      if (!best || score < best.score) {
        best = { fielder: f, score, t: r.t, dist: r.dist };
      }
    }
  }

  const ballEndDist = Math.hypot(endX, endZ);
  const reachedBoundary = ballEndDist >= BOUNDARY_R;

  let runs = 0, wicket = false, outcome = '', interceptedBy = null;

  if (best && lofted && best.dist < 2.5 && apex < 18) {
    wicket = true;
    outcome = `Caught by ${best.fielder.name}`;
    interceptedBy = best.fielder;
  } else if (best && best.t < 0.95) {
    interceptedBy = best.fielder;
    const inCircle = Math.hypot(best.fielder.x, best.fielder.z) < INNER_CIRCLE_R;
    if (lofted && best.dist < 4 && apex < 22 && rng() < 0.35) {
      wicket = true;
      outcome = `Caught by ${best.fielder.name}`;
    } else if (inCircle) {
      const r = rng();
      runs = r < 0.55 ? 0 : r < 0.9 ? 1 : 2;
      outcome = runs === 0 ? `Dot — fielded by ${best.fielder.name}` : `${runs} run${runs > 1 ? 's' : ''} (${best.fielder.name})`;
    } else {
      const r = rng();
      runs = r < 0.2 ? 1 : r < 0.7 ? 2 : 3;
      outcome = `${runs} runs (${best.fielder.name} cuts off)`;
    }
  } else if (reachedBoundary) {
    runs = lofted && apex > 8 ? 6 : 4;
    outcome = runs === 6 ? 'SIX!' : 'FOUR!';
  } else {
    runs = lofted ? 2 : ballEndDist > INNER_CIRCLE_R ? 3 : 2;
    outcome = `${runs} runs (gap found)`;
  }

  return {
    lineKey, lengthKey, lineName: line.name, lengthName: length.name,
    pitchPoint,
    zone: zone.id, zoneName: zone.name, angle,
    startXZ: [startX, startZ], endXZ: [endX, endZ],
    apex, lofted, distance, flightTime,
    runs, wicket, outcome,
    interceptedBy: interceptedBy ? interceptedBy.id : null,
    didShot: true,
  };
}

export function simulateOver(profile, fielders, balls = 6, deliveryPick = {}, rng = Math.random) {
  const results = [];
  for (let i = 0; i < balls; i++) {
    results.push(simulateBall(profile, fielders, deliveryPick, rng));
  }
  return results;
}

export function summarize(results) {
  const balls = results.length;
  const runs = results.reduce((s, r) => s + r.runs, 0);
  const wickets = results.filter((r) => r.wicket).length;
  const dots = results.filter((r) => r.runs === 0 && !r.wicket).length;
  const boundaries = results.filter((r) => r.runs >= 4).length;
  const economy = balls > 0 ? (runs / balls) * 6 : 0;
  const score = clamp(
    60 + wickets * 15 + dots * 4 - boundaries * 8 - Math.max(0, economy - 6) * 3,
    0, 100
  );
  let grade = 'F';
  if (score >= 85) grade = 'A+';
  else if (score >= 75) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else if (score >= 35) grade = 'D';
  return { balls, runs, wickets, dots, boundaries, economy, score: Math.round(score), grade };
}

// Export a helper for Ball.jsx so it can position the bowler release & bounce.
export const RELEASE_POINT = { x: 0, y: 2.1, z: PITCH_LENGTH + 0.2 };

