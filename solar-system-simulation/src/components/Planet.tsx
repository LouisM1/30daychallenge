"use client";

import React, { useRef, useState, useEffect } from 'react';
import { MeshProps, useFrame } from '@react-three/fiber';
import { Mesh, TextureLoader, Vector3 } from 'three';
import { useLoader } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { forwardRef } from 'react';

interface PlanetProps extends MeshProps {
  name: string;
  size: number;
  texture: string;
  distance: number;
  orbitalPeriod: number;
  speedFactor: number;
  isPaused: boolean;
  isFocused: boolean;
  onFocus: () => void;
}

const Planet = forwardRef<Mesh, PlanetProps>(({ 
  name, size, texture, distance, orbitalPeriod, speedFactor, 
  isPaused, isFocused, onFocus, ...props 
}, ref) => {
  const planetTexture = useLoader(TextureLoader, texture);
  const [hovered, setHovered] = useState(false);
  const [position, setPosition] = useState(new Vector3(distance, 0, 0));
  const lastTimeRef = useRef(0);
  const lastPositionRef = useRef(new Vector3(distance, 0, 0));

  useEffect(() => {
    if (isPaused) {
      lastTimeRef.current = performance.now() / 1000;
      lastPositionRef.current.copy(position);
    }
  }, [isPaused, position]);

  useFrame(({ clock }) => {
    if (ref && 'current' in ref && ref.current && !isPaused) {
      const currentTime = clock.getElapsedTime();
      const elapsedTime = isPaused ? 0 : currentTime - lastTimeRef.current;
      const totalTime = lastTimeRef.current + elapsedTime;
      
      const angle = (totalTime / orbitalPeriod) * Math.PI * 2 * speedFactor;
      const newPosition = new Vector3(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
      );
      setPosition(newPosition);
      ref.current.position.copy(newPosition);
      ref.current.rotation.y += 0.01 * speedFactor * (isPaused ? 0 : 1);
    }
  });

  const scale = hovered ? 1.1 : 1;

  return (
    <group>
      <mesh
        ref={ref}
        position={position}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={onFocus}
        scale={[scale, scale, scale]}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial map={planetTexture} />
      </mesh>
      {hovered && (
        <mesh position={position}>
          <sphereGeometry args={[size * 1.01, 32, 32]} />
          <meshBasicMaterial color="white" transparent opacity={0.25} />
        </mesh>
      )}
      {hovered && (
        <Html position={[position.x, position.y + size * 1.2, position.z]}>
          <div style={{
            background: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '2px 5px',
            borderRadius: '3px',
            fontSize: '12px',
          }}>
            {name}
          </div>
        </Html>
      )}
    </group>
  );
});

Planet.displayName = 'Planet';

export default Planet;