import { Canvas } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';
import { Suspense, useMemo, useRef, useState } from 'react';

import './App.css';
import { CAMERA_VIEWS, FIELD_PRESETS, BATSMAN_PRESETS, LINES, LENGTHS } from './lib/cricket.js';
import { simulateBall, summarize } from './lib/simulate.js';

import Stadium from './components/Stadium.jsx';
import CameraRig from './components/CameraRig.jsx';
import Ball from './components/Ball.jsx';
import FieldMap from './components/FieldMap.jsx';
import BatsmanPanel from './components/BatsmanPanel.jsx';
import PitchMap from './components/PitchMap.jsx';

function clonePreset(key) {
  const p = FIELD_PRESETS[key];
  return p.fielders.map((f) => ({ ...f }));
}

export default function App() {
  // ----- field state -----
  const [presetKey, setPresetKey] = useState('standardTest');
  const [fielders, setFielders] = useState(() => clonePreset('standardTest'));
  const [selectedId, setSelectedId] = useState(null);

  // ----- batsman state -----
  const [profile, setProfile] = useState(() => ({ ...BATSMAN_PRESETS.t20Power, presetKey: 't20Power' }));

  // ----- camera/view state -----
  const [view, setView] = useState('broadcast');
  const [showLabels, setShowLabels] = useState(true);
  const [orbit, setOrbit] = useState(false); // free orbit overrides POV when on

  // ----- bowling state -----
  const [lineKey, setLineKey] = useState('off');
  const [lengthKey, setLengthKey] = useState('good');
  const [varyDeliveries, setVaryDeliveries] = useState(false);

  // ----- simulation state -----
  const [results, setResults] = useState([]);
  const [currentBall, setCurrentBall] = useState(null);
  const [bowling, setBowling] = useState(false);
  const ballQueue = useRef([]);

  const summary = useMemo(() => (results.length ? summarize(results) : null), [results]);

  const applyPreset = (key) => {
    setPresetKey(key);
    setFielders(clonePreset(key));
    setResults([]);
  };

  const moveFielder = (id, x, z) => {
    setFielders((arr) => arr.map((f) => (f.id === id ? { ...f, x, z } : f)));
  };

  const playNext = () => {
    const next = ballQueue.current.shift();
    if (!next) {
      setBowling(false);
      setCurrentBall(null);
      return;
    }
    setCurrentBall({ ...next, _key: Math.random() });
    setResults((r) => [...r, next]);
  };

  const pickRandom = (obj) => {
    const keys = Object.keys(obj);
    return keys[Math.floor(Math.random() * keys.length)];
  };

  const bowl = (n) => {
    if (bowling) return;
    const balls = Array.from({ length: n }, () => {
      const lk = varyDeliveries ? pickRandom(LINES) : lineKey;
      const ln = varyDeliveries ? pickRandom(LENGTHS) : lengthKey;
      return simulateBall(profile, fielders, { lineKey: lk, lengthKey: ln });
    });
    ballQueue.current = balls;
    setResults([]);
    setBowling(true);
    setTimeout(playNext, 50);
  };

  const onBallDone = () => {
    // Hold the ball at landing briefly, then play next.
    setTimeout(playNext, 600);
  };

  const reset = () => {
    setResults([]);
    setCurrentBall(null);
    ballQueue.current = [];
    setBowling(false);
  };

  return (
    <div className="app">
      {/* LEFT: controls */}
      <aside className="left">
        <header>
          <h1>Cricket Field Sim</h1>
          <p className="sub">Set a field, profile the batsman, bowl, and rate it.</p>
        </header>

        <div className="panel">
          <h2>Camera</h2>
          <div className="grid2">
            {Object.entries(CAMERA_VIEWS).map(([k, v]) => (
              <button
                key={k}
                className={view === k && !orbit ? 'pill active' : 'pill'}
                onClick={() => { setView(k); setOrbit(false); }}
              >
                {v.name}
              </button>
            ))}
          </div>
          <label className="check">
            <input type="checkbox" checked={orbit} onChange={(e) => setOrbit(e.target.checked)} />
            Free orbit (mouse drag)
          </label>
          <label className="check">
            <input type="checkbox" checked={showLabels} onChange={(e) => setShowLabels(e.target.checked)} />
            Show player labels
          </label>
        </div>

        <div className="panel">
          <h2>Field Preset</h2>
          <select value={presetKey} onChange={(e) => applyPreset(e.target.value)}>
            {Object.entries(FIELD_PRESETS).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
          <p className="hint">{FIELD_PRESETS[presetKey].description}</p>
        </div>

        <BatsmanPanel profile={profile} setProfile={setProfile} />
      </aside>

      {/* CENTER: 3D stadium */}
      <main className="center">
        <Canvas shadows camera={{ fov: 55, position: CAMERA_VIEWS[view].pos }}>
          <color attach="background" args={['#7eb6e0']} />
          <fog attach="fog" args={['#aac8e0', 120, 360]} />
          <Suspense fallback={null}>
            <hemisphereLight args={['#cfe7ff', '#3a5a3a', 0.55]} />
            <ambientLight intensity={0.35} />
            <directionalLight
              position={[40, 80, 30]}
              intensity={1.4}
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-80}
              shadow-camera-right={80}
              shadow-camera-top={80}
              shadow-camera-bottom={-80}
            />
            <Stadium fielders={fielders} selectedId={selectedId} showLabels={showLabels} />
            {currentBall && <Ball key={currentBall._key} delivery={currentBall} onDone={onBallDone} />}
            <Environment preset="sunset" />
            {orbit
              ? <OrbitControls target={[0, 1, 10]} />
              : <CameraRig view={view} />
            }
          </Suspense>
        </Canvas>

        {currentBall && (
          <div className="overlay">
            <div className="overlay-line">
              <span className="tag">{currentBall.lineName}</span>
              <span className="tag">{currentBall.lengthName}</span>
              <span className="tag">{currentBall.zoneName}</span>
              <span className="tag">{currentBall.lofted ? 'lofted' : 'grounded'}</span>
            </div>
            <span className={currentBall.wicket ? 'out' : currentBall.runs >= 4 ? 'four' : ''}>
              {currentBall.outcome}
            </span>
          </div>
        )}
      </main>

      {/* RIGHT: field editor + sim */}
      <aside className="right">
        <div className="panel">
          <h2>Field Editor</h2>
          <p className="hint">Drag any fielder to reposition. Click to select.</p>
          <FieldMap
            fielders={fielders}
            onMove={moveFielder}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        <div className="panel">
          <h2>Bowler</h2>
          <p className="hint" style={{ marginTop: 0 }}>Pick line and length — the batsman's shot will be biased accordingly.</p>

          <PitchMap lineKey={lineKey} lengthKey={lengthKey} onPick={(lk, len) => { setLineKey(lk); setLengthKey(len); }} />

          <div className="bowler-row">
            <div className="bowler-col">
              <div className="bowler-label">LINE</div>
              <div className="pill-row">
                {Object.entries(LINES).map(([k, v]) => (
                  <button
                    key={k}
                    className={lineKey === k ? 'pill active' : 'pill'}
                    onClick={() => setLineKey(k)}
                    title={v.name}
                  >{v.short}</button>
                ))}
              </div>
            </div>
            <div className="bowler-col">
              <div className="bowler-label">LENGTH</div>
              <div className="pill-row">
                {Object.entries(LENGTHS).map(([k, v]) => (
                  <button
                    key={k}
                    className={lengthKey === k ? 'pill active' : 'pill'}
                    onClick={() => setLengthKey(k)}
                    title={v.name}
                  >{v.short}</button>
                ))}
              </div>
            </div>
          </div>

          <p className="hint">
            <b>{LINES[lineKey].name}</b> · <b>{LENGTHS[lengthKey].name}</b>
          </p>

          <label className="check">
            <input type="checkbox" checked={varyDeliveries} onChange={(e) => setVaryDeliveries(e.target.checked)} />
            Vary deliveries each ball
          </label>
        </div>

        <div className="panel">
          <h2>Bowl</h2>
          <div className="row buttons">
            <button onClick={() => bowl(1)} disabled={bowling}>Bowl 1</button>
            <button onClick={() => bowl(6)} disabled={bowling}>Bowl Over (6)</button>
            <button onClick={() => bowl(24)} disabled={bowling}>Bowl 4 Overs</button>
            <button onClick={reset} disabled={bowling}>Reset</button>
          </div>

          {summary && (
            <div className="summary">
              <div className="grade-card">
                <div className="grade">{summary.grade}</div>
                <div className="score">{summary.score}/100</div>
                <div className="label">Field Rating</div>
              </div>
              <div className="stats">
                <div><span>Balls</span><b>{summary.balls}</b></div>
                <div><span>Runs</span><b>{summary.runs}</b></div>
                <div><span>Wickets</span><b>{summary.wickets}</b></div>
                <div><span>Dots</span><b>{summary.dots}</b></div>
                <div><span>4s/6s</span><b>{summary.boundaries}</b></div>
                <div><span>Econ</span><b>{summary.economy.toFixed(2)}</b></div>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <ul className="ball-log">
              {results.map((r, i) => (
                <li key={i} className={r.wicket ? 'w' : r.runs >= 4 ? 'b' : r.runs === 0 ? 'd' : ''}>
                  <span className="bn">{i + 1}</span>
                  <span className="ln">{LINES[r.lineKey]?.short ?? '-'}/{LENGTHS[r.lengthKey]?.short ?? '-'}</span>
                  <span className="zn">{r.zoneName}</span>
                  <span className="rn">{r.wicket ? 'W' : r.runs}</span>
                  <span className="oc">{r.outcome}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
