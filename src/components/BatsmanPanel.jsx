import { SHOT_ZONES, BATSMAN_PRESETS } from '../lib/cricket.js';

// Normalize a probabilities object so its values sum to 1.
function normalize(probs) {
  const total = Object.values(probs).reduce((a, b) => a + b, 0) || 1;
  const out = {};
  for (const k of Object.keys(probs)) out[k] = probs[k] / total;
  return out;
}

export default function BatsmanPanel({ profile, setProfile }) {
  const onZone = (id, val) => {
    setProfile({
      ...profile,
      zoneProbs: { ...profile.zoneProbs, [id]: Number(val) },
    });
  };

  const normProbs = normalize(profile.zoneProbs);

  return (
    <div className="panel">
      <h2>Batsman Profile</h2>

      <label className="row">
        <span>Preset</span>
        <select
          value={profile.presetKey ?? ''}
          onChange={(e) => {
            const p = BATSMAN_PRESETS[e.target.value];
            if (p) setProfile({ ...p, presetKey: e.target.value });
          }}
        >
          <option value="">-- choose --</option>
          {Object.entries(BATSMAN_PRESETS).map(([k, v]) => (
            <option key={k} value={k}>{v.name}</option>
          ))}
        </select>
      </label>

      {profile.description && (
        <p className="hint">{profile.description}</p>
      )}

      <div className="row">
        <span>Power</span>
        <input
          type="range" min="0.2" max="1" step="0.01"
          value={profile.power}
          onChange={(e) => setProfile({ ...profile, power: Number(e.target.value), presetKey: null })}
        />
        <span className="value">{profile.power.toFixed(2)}</span>
      </div>

      <div className="row">
        <span>Loft %</span>
        <input
          type="range" min="0" max="0.8" step="0.01"
          value={profile.loftProb}
          onChange={(e) => setProfile({ ...profile, loftProb: Number(e.target.value), presetKey: null })}
        />
        <span className="value">{Math.round(profile.loftProb * 100)}%</span>
      </div>

      <h3>Shot Distribution</h3>
      <div className="zones">
        {SHOT_ZONES.map((z) => (
          <div key={z.id} className="zone-row">
            <span className={`zone-name side-${z.side}`}>{z.name}</span>
            <input
              type="range" min="0" max="1" step="0.01"
              value={profile.zoneProbs[z.id] ?? 0}
              onChange={(e) => onZone(z.id, e.target.value)}
            />
            <span className="value">{Math.round(normProbs[z.id] * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
