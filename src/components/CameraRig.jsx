import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import { CAMERA_VIEWS } from '../lib/cricket.js';

// Smoothly moves the camera to the selected POV.
export default function CameraRig({ view }) {
  const { camera } = useThree();
  const target = useRef(new Vector3());
  const desiredPos = useRef(new Vector3());

  useEffect(() => {
    const v = CAMERA_VIEWS[view] ?? CAMERA_VIEWS.broadcast;
    desiredPos.current.set(...v.pos);
    target.current.set(...v.look);
  }, [view]);

  useFrame((_, dt) => {
    camera.position.lerp(desiredPos.current, Math.min(1, dt * 3));
    camera.lookAt(target.current);
  });

  return null;
}
