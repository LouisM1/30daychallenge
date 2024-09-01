import React, { useMemo } from 'react';
import { Line } from '@react-three/drei';
import * as THREE from 'three';

interface OrbitLineProps {
  radius: number;
  segments?: number;
}

const OrbitLine: React.FC<OrbitLineProps> = ({ radius, segments = 64 }) => {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius, segments]);

  return (
    <Line
      points={points}
      color="white"
      lineWidth={0.5}
      transparent
      opacity={0.2}
    />
  );
};

OrbitLine.displayName = 'OrbitLine';

export default OrbitLine;