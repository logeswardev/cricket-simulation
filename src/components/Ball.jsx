import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PITCH_LENGTH } from '../lib/cricket.js';

// 3-phase ball animation:
//   1. Delivery: bowler release point → pitching spot (with arc)
//   2. Bounce: pitching spot → impact at the batsman
//   3. Shot:   from striker → endXZ (only if didShot)
const RELEASE = { x: 0, y: 2.1, z: PITCH_LENGTH + 0.2 };
const IMPACT = { x: 0, y: 0.9, z: 1.0 };

export default function Ball({ delivery, onDone }) {
  const ref = useRef();
  const elapsed = useRef(0);
  const done = useRef(false);

  useFrame((_, dt) => {
    if (!ref.current || !delivery || done.current) return;
    elapsed.current += dt;

    const tDeliver = 0.45;
    const tBounce = 0.18;
    const tShot = Math.max(0.5, Math.min(2.5, delivery.flightTime || 1));
    const totalShot = delivery.didShot ? tShot : 0;
    const total = tDeliver + tBounce + totalShot;

    const t = elapsed.current;
    const px = delivery.pitchPoint?.x ?? 0;
    const pz = delivery.pitchPoint?.z ?? 6;
    let x, y, z;

    if (t < tDeliver) {
      const u = t / tDeliver;
      x = RELEASE.x + (px - RELEASE.x) * u;
      z = RELEASE.z + (pz - RELEASE.z) * u;
      // Arc from release height down to bounce
      y = RELEASE.y * (1 - u) + 0.05 + Math.sin(Math.PI * u) * 0.4;
    } else if (t < tDeliver + tBounce) {
      const u = (t - tDeliver) / tBounce;
      x = px + (IMPACT.x - px) * u;
      z = pz + (IMPACT.z - pz) * u;
      y = 0.05 + 1.4 * u * (1 - u) + IMPACT.y * u;
    } else if (delivery.didShot) {
      const u = (t - tDeliver - tBounce) / totalShot;
      const [sx, sz] = delivery.startXZ;
      const [ex, ez] = delivery.endXZ;
      x = sx + (ex - sx) * u;
      z = sz + (ez - sz) * u;
      const apex = delivery.lofted ? delivery.apex : 0.6;
      y = 4 * apex * u * (1 - u) + 0.1;
    } else {
      x = IMPACT.x;
      z = IMPACT.z - 0.6;
      y = 0.1;
    }

    ref.current.position.set(x, y, z);

    if (elapsed.current >= total) {
      done.current = true;
      onDone?.();
    }
  });

  if (!delivery) return null;
  return (
    <>
      <mesh ref={ref} position={[RELEASE.x, RELEASE.y, RELEASE.z]} castShadow>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshStandardMaterial color="#c62828" emissive="#5b0000" emissiveIntensity={0.35} roughness={0.5} />
      </mesh>
      {/* Pitch landing marker */}
      {delivery.pitchPoint && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[delivery.pitchPoint.x, 0.014, delivery.pitchPoint.z]}
        >
          <ringGeometry args={[0.18, 0.28, 24]} />
          <meshBasicMaterial color="#ffeb3b" transparent opacity={0.85} />
        </mesh>
      )}
    </>
  );
}

