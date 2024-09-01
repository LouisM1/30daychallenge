import React from 'react';

interface OrbitMarkerProps {
  distance: number;
}

const OrbitMarker: React.FC<OrbitMarkerProps> = ({ distance }) => {
  return (
    <mesh position={[distance, 0, 0]}>
      <sphereGeometry args={[0.02, 16, 16]} />
      <meshBasicMaterial color="#FFFFFF" transparent opacity={0.5} />
    </mesh>
  );
};

export default OrbitMarker;