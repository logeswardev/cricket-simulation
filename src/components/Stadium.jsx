import { useMemo } from 'react';
import { Text } from '@react-three/drei';
import { BOUNDARY_R, INNER_CIRCLE_R, PITCH_LENGTH, PITCH_WIDTH, STUMP_HEIGHT } from '../lib/cricket.js';

function Ground() {
  // Generate alternating mower stripes as wedge sectors around the field center.
  // 24 wedges of 15° each, alternating shades of green for that "mowed lawn" look.
  const stripes = [];
  const segs = 24;
  for (let i = 0; i < segs; i++) {
    const start = (i / segs) * Math.PI * 2;
    const end = ((i + 1) / segs) * Math.PI * 2;
    stripes.push({ start, end, light: i % 2 === 0 });
  }
  return (
    <>
      {/* Outer grass apron beyond the stadium */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, PITCH_LENGTH / 2]} receiveShadow>
        <circleGeometry args={[260, 64]} />
        <meshStandardMaterial color="#1b5e20" roughness={1} />
      </mesh>

      {/* Base playing field */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, PITCH_LENGTH / 2]} receiveShadow>
        <circleGeometry args={[BOUNDARY_R + 6, 128]} />
        <meshStandardMaterial color="#357a37" roughness={1} />
      </mesh>

      {/* Mower stripes — wedge sectors */}
      <group position={[0, -0.025, PITCH_LENGTH / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        {stripes.map((s, i) => (
          <mesh key={i}>
            <ringGeometry args={[0, BOUNDARY_R, 1, 1, s.start, s.end - s.start]} />
            <meshStandardMaterial
              color={s.light ? '#3f8f44' : '#2f7233'}
              roughness={1}
            />
          </mesh>
        ))}
      </group>

      {/* Faint outer "trample" band closer to boundary (worn area) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.018, PITCH_LENGTH / 2]} receiveShadow>
        <ringGeometry args={[BOUNDARY_R - 8, BOUNDARY_R - 1, 96]} />
        <meshStandardMaterial color="#406b34" roughness={1} transparent opacity={0.55} />
      </mesh>

      {/* Square — a rectangular cricket "block" of multiple pitches in browner grass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.012, PITCH_LENGTH / 2]} receiveShadow>
        <planeGeometry args={[18, PITCH_LENGTH + 4]} />
        <meshStandardMaterial color="#6b7a3a" roughness={1} />
      </mesh>

      {/* Boundary rope */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, PITCH_LENGTH / 2]}>
        <ringGeometry args={[BOUNDARY_R - 0.25, BOUNDARY_R, 96]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* 30-yard inner circle (dashed look approximated with low opacity ring) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, PITCH_LENGTH / 2]}>
        <ringGeometry args={[INNER_CIRCLE_R - 0.15, INNER_CIRCLE_R, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
      </mesh>
    </>
  );
}

// A ring of stadium stands wrapping the boundary.
function Stands() {
  // Use multiple concentric tilted rings to fake tiered seating + a back wall.
  const center = [0, 0, PITCH_LENGTH / 2];
  return (
    <group position={center}>
      {/* Advertising boards just outside the rope */}
      <mesh position={[0, 1.1, 0]}>
        <cylinderGeometry args={[BOUNDARY_R + 1.2, BOUNDARY_R + 1.2, 2.2, 96, 1, true]} />
        <meshStandardMaterial color="#e53935" side={2} />
      </mesh>

      {/* Lower tier (crowd) */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[BOUNDARY_R + 14, BOUNDARY_R + 4, 7, 96, 1, true]} />
        <meshStandardMaterial color="#26344a" side={2} roughness={0.95} />
      </mesh>
      {/* Crowd "speckle" — rough emissive band so it reads as a packed crowd at distance */}
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[BOUNDARY_R + 9, BOUNDARY_R + 4.5, 6.6, 96, 1, true]} />
        <meshStandardMaterial color="#5b6f8a" emissive="#2a3a55" emissiveIntensity={0.4} side={2} roughness={1} />
      </mesh>

      {/* Upper tier */}
      <mesh position={[0, 13, 0]}>
        <cylinderGeometry args={[BOUNDARY_R + 22, BOUNDARY_R + 14, 9, 96, 1, true]} />
        <meshStandardMaterial color="#1f2a3c" side={2} roughness={0.95} />
      </mesh>

      {/* Roof rim */}
      <mesh position={[0, 18.5, 0]}>
        <cylinderGeometry args={[BOUNDARY_R + 24, BOUNDARY_R + 22, 1.5, 96, 1, true]} />
        <meshStandardMaterial color="#0e1422" side={2} />
      </mesh>
    </group>
  );
}

// Four floodlight pylons at compass points around the stadium.
function Floodlights() {
  const r = BOUNDARY_R + 26;
  const cz = PITCH_LENGTH / 2;
  const positions = [
    [r, cz], [-r, cz], [0, cz + r], [0, cz - r],
  ];
  return (
    <group>
      {positions.map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 12, 0]} castShadow>
            <cylinderGeometry args={[0.25, 0.4, 24, 8]} />
            <meshStandardMaterial color="#cfd8dc" />
          </mesh>
          <mesh position={[0, 24.5, 0]}>
            <boxGeometry args={[3, 1.2, 0.6]} />
            <meshStandardMaterial color="#263238" />
          </mesh>
          {/* Glow plate */}
          <mesh position={[0, 24.5, 0]}>
            <boxGeometry args={[2.95, 1.15, 0.05]} />
            <meshStandardMaterial color="#fffde7" emissive="#fff59d" emissiveIntensity={1.2} />
          </mesh>
          {/* Light cast over the field */}
          <pointLight position={[0, 24, 0]} intensity={0.6} distance={120} color="#fff8e1" />
        </group>
      ))}
    </group>
  );
}

// Big sky dome with a gradient (day/dusk).
function Sky() {
  return (
    <mesh>
      <sphereGeometry args={[480, 32, 32]} />
      <meshBasicMaterial color="#7eb6e0" side={1 /* BackSide */} />
    </mesh>
  );
}

function Pitch() {
  return (
    <group>
      {/* Pitch base — sun-baked beige */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, PITCH_LENGTH / 2]} receiveShadow>
        <planeGeometry args={[PITCH_WIDTH, PITCH_LENGTH]} />
        <meshStandardMaterial color="#c2a06a" roughness={1} />
      </mesh>
      {/* Slightly darker central strip — where the ball lands most */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.011, PITCH_LENGTH / 2]} receiveShadow>
        <planeGeometry args={[PITCH_WIDTH * 0.55, PITCH_LENGTH - 4]} />
        <meshStandardMaterial color="#a88752" roughness={1} />
      </mesh>
      {/* Worn rough patches at bowler's good-length spots, both ends */}
      {[5, PITCH_LENGTH - 5].map((z, i) => (
        <mesh key={`rough-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, z]}>
          <circleGeometry args={[0.7, 24]} />
          <meshStandardMaterial color="#8a6a3a" roughness={1} />
        </mesh>
      ))}
      {/* Footmarks outside off stump (where bowlers land) */}
      {[3.2, PITCH_LENGTH - 3.2].map((z, i) => (
        <mesh key={`foot-${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[0.9, 0.012, z]}>
          <circleGeometry args={[0.35, 16]} />
          <meshStandardMaterial color="#7a5a2c" roughness={1} />
        </mesh>
      ))}

      {/* Popping creases */}
      {[1.22, PITCH_LENGTH - 1.22].map((z, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.013, z]}>
          <planeGeometry args={[PITCH_WIDTH + 0.4, 0.05]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
      ))}
      {/* Return creases (vertical lines beside stumps) */}
      {[0, PITCH_LENGTH].flatMap((z) =>
        [-0.66, 0.66].map((x, j) => (
          <mesh key={`rc-${z}-${j}`} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.013, z + (z === 0 ? 0.6 : -0.6)]}>
            <planeGeometry args={[0.05, 1.3]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))
      )}
    </group>
  );
}

function Stumps({ z }) {
  const stumpPositions = [-0.11, 0, 0.11];
  return (
    <group position={[0, 0, z]}>
      {stumpPositions.map((x, i) => (
        <mesh key={i} position={[x, STUMP_HEIGHT / 2, 0]} castShadow>
          <cylinderGeometry args={[0.018, 0.018, STUMP_HEIGHT, 8]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
      ))}
      <mesh position={[-0.055, STUMP_HEIGHT + 0.01, 0]} castShadow>
        <boxGeometry args={[0.11, 0.015, 0.015]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
      <mesh position={[0.055, STUMP_HEIGHT + 0.01, 0]} castShadow>
        <boxGeometry args={[0.11, 0.015, 0.015]} />
        <meshStandardMaterial color="#f5f5f5" />
      </mesh>
    </group>
  );
}

// Humanoid fielder/player. Head, torso (jersey), arms, legs, shoes.
// `facing` rotates the body around Y so they look toward the batsman.
function Player({ position, color, label, facing = 0, role = 'fielder', selected = false }) {
  const [x, , z] = position;
  const skin = '#e0ac69';
  const pants = role === 'batsman' || role === 'nonStriker' ? '#f5f5f5'
              : role === 'umpire' ? '#0f1115'
              : '#1c2330';
  const shoes = '#111';
  const helmet = role === 'batsman' || role === 'keeper';
  const padded = role === 'batsman' || role === 'nonStriker' || role === 'keeper';
  const jerseyColor = selected ? '#ffeb3b' : color;

  return (
    <group position={[x, 0, z]} rotation={[0, facing, 0]}>
      {/* Legs */}
      <mesh position={[-0.13, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.8, 10]} />
        <meshStandardMaterial color={pants} />
      </mesh>
      <mesh position={[0.13, 0.4, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.08, 0.8, 10]} />
        <meshStandardMaterial color={pants} />
      </mesh>
      {/* Shoes */}
      <mesh position={[-0.13, 0.04, 0.05]} castShadow>
        <boxGeometry args={[0.18, 0.08, 0.32]} />
        <meshStandardMaterial color={shoes} />
      </mesh>
      <mesh position={[0.13, 0.04, 0.05]} castShadow>
        <boxGeometry args={[0.18, 0.08, 0.32]} />
        <meshStandardMaterial color={shoes} />
      </mesh>
      {/* Pads (if batsman/keeper) */}
      {padded && (
        <>
          <mesh position={[-0.13, 0.4, 0.09]} castShadow>
            <boxGeometry args={[0.22, 0.78, 0.08]} />
            <meshStandardMaterial color="#fafafa" />
          </mesh>
          <mesh position={[0.13, 0.4, 0.09]} castShadow>
            <boxGeometry args={[0.22, 0.78, 0.08]} />
            <meshStandardMaterial color="#fafafa" />
          </mesh>
        </>
      )}

      {/* Torso (jersey) */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.5, 0.55, 0.28]} />
        <meshStandardMaterial color={jerseyColor} />
      </mesh>
      {/* Shoulders */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <sphereGeometry args={[0.27, 16, 12]} />
        <meshStandardMaterial color={jerseyColor} />
      </mesh>

      {/* Arms — slightly forward in a "ready" pose */}
      <group position={[-0.32, 1.18, 0.05]} rotation={[0.3, 0, 0.15]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.5, 10]} />
          <meshStandardMaterial color={jerseyColor} />
        </mesh>
        <mesh position={[0, -0.5, 0.05]} castShadow>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>
      <group position={[0.32, 1.18, 0.05]} rotation={[0.3, 0, -0.15]}>
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.06, 0.5, 10]} />
          <meshStandardMaterial color={jerseyColor} />
        </mesh>
        <mesh position={[0, -0.5, 0.05]} castShadow>
          <sphereGeometry args={[0.07, 12, 12]} />
          <meshStandardMaterial color={skin} />
        </mesh>
      </group>

      {/* Neck */}
      <mesh position={[0, 1.45, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.08, 0.08, 10]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.13, 18, 18]} />
        <meshStandardMaterial color={skin} />
      </mesh>
      {/* Hair / cap */}
      {!helmet && (
        <mesh position={[0, 1.66, -0.01]} castShadow>
          <sphereGeometry args={[0.135, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2.2]} />
          <meshStandardMaterial color={role === 'umpire' ? '#222' : '#1a1a1a'} />
        </mesh>
      )}
      {/* Cap peak (non-helmet) */}
      {!helmet && role !== 'umpire' && (
        <mesh position={[0, 1.62, 0.13]} castShadow>
          <boxGeometry args={[0.22, 0.04, 0.12]} />
          <meshStandardMaterial color={jerseyColor} />
        </mesh>
      )}
      {/* Helmet */}
      {helmet && (
        <>
          <mesh position={[0, 1.62, 0]} castShadow>
            <sphereGeometry args={[0.16, 18, 18]} />
            <meshStandardMaterial color="#1a237e" />
          </mesh>
          {/* Grille */}
          <mesh position={[0, 1.58, 0.13]} castShadow>
            <boxGeometry args={[0.2, 0.1, 0.04]} />
            <meshStandardMaterial color="#212121" />
          </mesh>
        </>
      )}

      {/* Bat (batsman) */}
      {role === 'batsman' && (
        <group position={[0.28, 0.55, 0.15]} rotation={[0.3, 0.4, -0.6]}>
          <mesh castShadow>
            <boxGeometry args={[0.11, 0.85, 0.04]} />
            <meshStandardMaterial color="#d7b27b" />
          </mesh>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.025, 0.025, 0.25, 8]} />
            <meshStandardMaterial color="#3e2723" />
          </mesh>
        </group>
      )}

      {/* Selection ring */}
      {selected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
          <ringGeometry args={[0.55, 0.7, 32]} />
          <meshBasicMaterial color="#ffeb3b" transparent opacity={0.85} />
        </mesh>
      )}

      {label && (
        <Text
          position={[0, 2.15, 0]}
          rotation={[0, -facing, 0]}
          fontSize={0.45}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#000000"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

// Compute Y-rotation so the player faces a target point in XZ.
function faceToward(fromX, fromZ, toX, toZ) {
  return Math.atan2(toX - fromX, toZ - fromZ);
}

export default function Stadium({ fielders, selectedId, showLabels }) {
  const fielderNodes = useMemo(
    () =>
      fielders.map((f) => (
        <Player
          key={f.id}
          position={[f.x, 0, f.z]}
          color="#1976d2"
          facing={faceToward(f.x, f.z, 0, 0)}
          role="fielder"
          selected={selectedId === f.id}
          label={showLabels ? f.name : null}
        />
      )),
    [fielders, selectedId, showLabels]
  );

  return (
    <group>
      <Sky />
      <Stands />
      <Floodlights />
      <Ground />
      <Pitch />
      <Stumps z={0} />
      <Stumps z={PITCH_LENGTH} />

      {/* Batsman faces bowler */}
      <Player
        position={[-0.4, 0, 1.5]}
        color="#ff7043"
        role="batsman"
        facing={faceToward(-0.4, 1.5, 0, PITCH_LENGTH)}
        label={showLabels ? 'Batsman' : null}
      />
      {/* Non-striker faces striker */}
      <Player
        position={[0, 0, PITCH_LENGTH - 1.5]}
        color="#ff7043"
        role="nonStriker"
        facing={faceToward(0, PITCH_LENGTH - 1.5, 0, 0)}
        label={showLabels ? 'Non-striker' : null}
      />
      {/* Bowler faces batsman */}
      <Player
        position={[0, 0, PITCH_LENGTH + 1.2]}
        color="#1976d2"
        role="bowler"
        facing={faceToward(0, PITCH_LENGTH + 1.2, 0, 0)}
        label={showLabels ? 'Bowler' : null}
      />
      {/* Umpire faces batsman */}
      <Player
        position={[1.5, 0, PITCH_LENGTH + 0.5]}
        color="#0f1115"
        role="umpire"
        facing={faceToward(1.5, PITCH_LENGTH + 0.5, 0, 0)}
        label={showLabels ? 'Umpire' : null}
      />
      {/* Keeper faces bowler/batsman */}
      <Player
        position={[0, 0, -1.8]}
        color="#1976d2"
        role="keeper"
        facing={faceToward(0, -1.8, 0, PITCH_LENGTH)}
        label={showLabels ? 'Keeper' : null}
      />

      {fielderNodes}
    </group>
  );
}
