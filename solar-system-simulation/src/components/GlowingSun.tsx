"use client";

import React, { useRef, useState } from 'react';
import { TextureLoader, Mesh, Vector3 } from 'three';
import { useLoader, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

interface GlowingSunProps {
  position: [number, number, number];
  intensity?: number;
}

const GlowingSun: React.FC<GlowingSunProps> = ({ position, intensity = 10 }) => {
  const texture = useLoader(TextureLoader, '/textures/sun.jpg');
  const meshRef = useRef<Mesh>(null!);
  const [hovered, setHovered] = useState(false);
  const [sunPosition, setSunPosition] = useState(new Vector3(...position));

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002; // Adjust this value to change rotation speed
    }
  });

  const scale = hovered ? 1.1 : 1;

  return (
    <group>
      <mesh
        position={position}
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={[scale, scale, scale]}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      {hovered && (
        <mesh position={sunPosition}>
          <sphereGeometry args={[1.01, 32, 32]} />
          <meshBasicMaterial color="white" transparent opacity={0.25} />
        </mesh>
      )}
      <pointLight position={position} intensity={intensity} distance={100} decay={1} />
      {hovered && (
        <Html position={[sunPosition.x, sunPosition.y + 1.2, sunPosition.z]}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '2px 5px',
            borderRadius: '3px',
            fontSize: '12px',
          }}>
            Sun
          </div>
        </Html>
      )}
    </group>
  );
};

export default GlowingSun;