// Cricket field constants & presets.
// Coordinate system:
//  - Origin = striker's stumps (batsman end)
//  - +Y is up
//  - +Z points toward the bowler (bowler stumps at z = PITCH_LENGTH)
//  - For a right-handed batsman: +X = off side, -X = leg side
// All distances in meters.

export const PITCH_LENGTH = 20.12;
export const PITCH_WIDTH = 3.05;
export const INNER_CIRCLE_R = 27.4; // 30 yards
export const BOUNDARY_R = 65;
export const STUMP_HEIGHT = 0.71;

// ---------- Bowling: line and length ----------
// Length = how far up the pitch the ball pitches (z meters from striker stumps).
// zoneBias multiplies the batsman's zone probabilities — short balls pull the
// batsman square, full balls drive forward, etc.
// powerMod / loftMod adjust shot power & lofted-shot probability.
// dotBias and wicketBias add to the chance of a dot or wicket independent of fielders.
export const LENGTHS = {
  yorker:    {
    name: 'Yorker',           short: 'YK', z: 1.2,
    powerMod: -0.18, loftMod: -0.25, dotBias: 0.20, wicketBias: 0.06,
    zoneBias: { straight: 1.4, midwicket: 1.2, fineleg: 1.0, point: 0.4, thirdman: 0.4, cover: 0.7, squareleg: 0.8 },
  },
  full:      {
    name: 'Full',             short: 'F',  z: 3.5,
    powerMod: 0.06, loftMod: 0.08, dotBias: -0.05, wicketBias: 0.0,
    zoneBias: { straight: 1.3, cover: 1.4, midwicket: 1.3, fineleg: 0.9, squareleg: 0.8, point: 0.5, thirdman: 0.5 },
  },
  good:      {
    name: 'Good',             short: 'G',  z: 6.5,
    powerMod: -0.04, loftMod: -0.04, dotBias: 0.10, wicketBias: 0.02,
    zoneBias: { straight: 1.0, cover: 1.0, point: 0.9, thirdman: 0.9, fineleg: 1.0, squareleg: 1.0, midwicket: 1.0 },
  },
  back:      {
    name: 'Back of length',   short: 'B',  z: 9.0,
    powerMod: 0.02, loftMod: 0.04, dotBias: 0.05, wicketBias: 0.0,
    zoneBias: { point: 1.4, cover: 0.8, midwicket: 1.2, squareleg: 1.3, straight: 0.6, thirdman: 1.1, fineleg: 1.0 },
  },
  short:     {
    name: 'Short',            short: 'S',  z: 11.5,
    powerMod: 0.10, loftMod: 0.18, dotBias: -0.03, wicketBias: 0.01,
    zoneBias: { point: 1.6, squareleg: 1.6, midwicket: 1.3, thirdman: 1.2, fineleg: 1.1, straight: 0.3, cover: 0.4 },
  },
  bouncer:   {
    name: 'Bouncer',          short: 'BN', z: 13.0,
    powerMod: 0.14, loftMod: 0.30, dotBias: 0.05, wicketBias: 0.04,
    zoneBias: { squareleg: 1.8, fineleg: 1.5, midwicket: 1.3, thirdman: 1.4, point: 1.3, straight: 0.2, cover: 0.3 },
  },
};

// Line = lateral position the ball pitches on (x meters; +x = off, -x = leg).
export const LINES = {
  wideOff:  { name: 'Wide Off',   short: 'WO', x:  0.55,
              zoneBias: { point: 1.5, thirdman: 1.4, cover: 1.2, squareleg: 0.4, fineleg: 0.4, midwicket: 0.4, straight: 0.6 } },
  off:      { name: 'Off Stump',  short: 'O',  x:  0.18,
              zoneBias: { cover: 1.3, point: 1.0, straight: 1.1, midwicket: 0.6, squareleg: 0.5, fineleg: 0.5, thirdman: 0.9 } },
  middle:   { name: 'Middle',     short: 'M',  x:  0.0,
              zoneBias: { straight: 1.3, midwicket: 1.1, cover: 1.0, point: 0.8, squareleg: 0.9, fineleg: 0.7, thirdman: 0.6 } },
  leg:      { name: 'Leg Stump',  short: 'L',  x: -0.18,
              zoneBias: { midwicket: 1.5, squareleg: 1.4, fineleg: 1.2, straight: 1.0, cover: 0.5, point: 0.4, thirdman: 0.4 } },
  wideLeg:  { name: 'Wide Leg',   short: 'WL', x: -0.55,
              zoneBias: { fineleg: 1.6, squareleg: 1.5, midwicket: 1.0, straight: 0.4, cover: 0.3, point: 0.3, thirdman: 1.0 } },
};


// Eight shot zones around the batsman, defined by angle ranges.
// Angle convention: 0° = straight down the ground toward the bowler (+Z).
// Increases clockwise when viewed from above (so 90° = +X = point/off side for RHB).
// Wedge 4 (180°) covers behind the batsman where the keeper stands — no shot played there.
export const SHOT_ZONES = [
  { id: 'straight',  name: 'Straight',    start: -22.5, end:  22.5,  side: 'mid' },
  { id: 'cover',     name: 'Cover',       start:  22.5, end:  67.5,  side: 'off' },
  { id: 'point',     name: 'Point',       start:  67.5, end: 112.5,  side: 'off' },
  { id: 'thirdman',  name: 'Third Man',   start: 112.5, end: 157.5,  side: 'off' },
  { id: 'fineleg',   name: 'Fine Leg',    start: 202.5, end: 247.5,  side: 'leg' },
  { id: 'squareleg', name: 'Square Leg',  start: 247.5, end: 292.5,  side: 'leg' },
  { id: 'midwicket', name: 'Midwicket',   start: 292.5, end: 337.5,  side: 'leg' },
];

// Default field positions (right-handed batsman). x = off side (+), z = toward bowler.
// Keeper/slips have z slightly negative (behind striker's stumps).
export const FIELDING_POSITIONS = {
  keeper:        { name: 'Keeper',        x:  0,   z:  -2 },
  firstSlip:     { name: '1st Slip',      x:  2,   z:  -2.5 },
  secondSlip:    { name: '2nd Slip',      x:  3.5, z:  -2.5 },
  thirdSlip:     { name: '3rd Slip',      x:  5,   z:  -2.5 },
  gully:         { name: 'Gully',         x:  7,   z:  -1 },
  point:         { name: 'Point',         x: 18,   z:   2 },
  cover:         { name: 'Cover',         x: 14,   z:   9 },
  extraCover:    { name: 'Extra Cover',   x:  9,   z:  14 },
  midOff:        { name: 'Mid-Off',       x:  6,   z:  19 },
  midOn:         { name: 'Mid-On',        x: -6,   z:  19 },
  midwicket:     { name: 'Midwicket',     x:-13,   z:   9 },
  squareLeg:     { name: 'Square Leg',    x:-17,   z:   2 },
  fineLeg:       { name: 'Fine Leg',      x:-12,   z: -10 },
  thirdMan:      { name: 'Third Man',     x: 12,   z: -12 },
  longOff:       { name: 'Long-Off',      x:  8,   z:  52 },
  longOn:        { name: 'Long-On',       x: -8,   z:  52 },
  deepCover:     { name: 'Deep Cover',    x: 38,   z:  28 },
  deepPoint:     { name: 'Deep Point',    x: 55,   z:   5 },
  deepMidwicket: { name: 'Deep Midwicket',x:-38,   z:  28 },
  deepSquareLeg: { name: 'Deep Sq Leg',   x:-55,   z:   5 },
  deepFineLeg:   { name: 'Deep Fine Leg', x:-30,   z: -32 },
  deepThirdMan:  { name: 'Deep Third Man',x: 30,   z: -32 },
  cowCorner:     { name: 'Cow Corner',    x:-42,   z:  42 },
  sweeper:       { name: 'Sweeper Cover', x: 50,   z:  20 },
};

const make = (keys) =>
  keys.map((k, i) => ({
    id: `f${i}`,
    role: k,
    name: FIELDING_POSITIONS[k].name,
    x: FIELDING_POSITIONS[k].x,
    z: FIELDING_POSITIONS[k].z,
  }));

// Field presets — 9 outfielders + keeper (10 fielders + bowler = 11).
// We model 9 movable fielders here; keeper + bowler are rendered separately.
export const FIELD_PRESETS = {
  attacking: {
    name: 'Attacking (Test)',
    description: '3 slips, gully, close catchers — all-out attack',
    fielders: make(['firstSlip','secondSlip','thirdSlip','gully','point','cover','midOff','midOn','squareLeg']),
  },
  standardTest: {
    name: 'Standard Test',
    description: 'Slip + gully, ring field, one out',
    fielders: make(['firstSlip','gully','point','cover','midOff','midOn','midwicket','squareLeg','fineLeg']),
  },
  odi: {
    name: 'ODI Field',
    description: 'Ring field with sweepers, one slip',
    fielders: make(['firstSlip','point','cover','midOff','midOn','midwicket','squareLeg','deepFineLeg','deepCover']),
  },
  t20Defensive: {
    name: 'T20 Defensive',
    description: 'Boundary riders covering all sides',
    fielders: make(['point','cover','midOff','midOn','midwicket','deepSquareLeg','deepFineLeg','deepCover','cowCorner']),
  },
  legsideTrap: {
    name: 'Leg-side Trap',
    description: 'Pack the leg side for cross-batted hitters',
    fielders: make(['firstSlip','midOff','midwicket','squareLeg','fineLeg','deepSquareLeg','deepFineLeg','deepMidwicket','cowCorner']),
  },
};

// Batsman profile presets — probability of playing into each shot zone,
// plus average power (0..1) and lofted-shot probability.
// Probabilities should sum to ~1.0 across the 7 zones.
export const BATSMAN_PRESETS = {
  classical: {
    name: 'Classical Technician',
    description: 'Strong off-side player, plays straight, rarely cross-bats',
    zoneProbs: { straight: 0.22, cover: 0.28, point: 0.18, thirdman: 0.06, fineleg: 0.06, squareleg: 0.08, midwicket: 0.12 },
    power: 0.55,
    loftProb: 0.12,
  },
  legsideBully: {
    name: 'Leg-side Bully',
    description: 'Slogs across the line — square leg & midwicket merchant',
    zoneProbs: { straight: 0.10, cover: 0.06, point: 0.04, thirdman: 0.04, fineleg: 0.14, squareleg: 0.26, midwicket: 0.36 },
    power: 0.78,
    loftProb: 0.42,
  },
  t20Power: {
    name: 'T20 Power Hitter',
    description: 'Goes hard down the ground and over cow corner',
    zoneProbs: { straight: 0.26, cover: 0.10, point: 0.06, thirdman: 0.04, fineleg: 0.06, squareleg: 0.10, midwicket: 0.38 },
    power: 0.85,
    loftProb: 0.55,
  },
  cutPuller: {
    name: 'Cut & Pull Specialist',
    description: 'Loves anything short — point and square leg in play',
    zoneProbs: { straight: 0.08, cover: 0.10, point: 0.30, thirdman: 0.10, fineleg: 0.06, squareleg: 0.30, midwicket: 0.06 },
    power: 0.70,
    loftProb: 0.30,
  },
  nudger: {
    name: 'Nudger / Accumulator',
    description: 'Singles all round the wicket, low risk',
    zoneProbs: { straight: 0.16, cover: 0.16, point: 0.14, thirdman: 0.10, fineleg: 0.10, squareleg: 0.16, midwicket: 0.18 },
    power: 0.40,
    loftProb: 0.06,
  },
};

export const CAMERA_VIEWS = {
  keeper:    { name: 'Keeper POV',    pos: [0, 1.7, -3],   look: [0, 1, 20] },
  slip:      { name: 'Slip POV',      pos: [4, 1.6, -3],   look: [0, 1, 20] },
  bowler:    { name: 'Bowler POV',    pos: [0, 1.8, 22],   look: [0, 1, 0] },
  umpire:    { name: 'Umpire POV',    pos: [0, 1.9, 22.5], look: [0, 1, 0] },
  broadcast: { name: 'Broadcast',     pos: [0, 12, -22],   look: [0, 0, 10] },
  topDown:   { name: 'Top-Down',      pos: [0, 90, 10],    look: [0, 0, 10] },
};
