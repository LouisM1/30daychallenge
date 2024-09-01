"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei';
import Planet from './Planet';
import GlowingSun from './GlowingSun';
import OrbitLine from './OrbitLine';
import YearCounter from './YearCounter';
import OrbitMarker from './OrbitMarker';
import CameraController from './CameraController';
import { Mesh } from 'three';
import PlanetInfo from './PlanetInfo';

const SolarSystem = () => {
  const [focusedPlanet, setFocusedPlanet] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const controlsRef = useRef<any>(null);
  const planetRefs = useRef<Record<string, React.RefObject<Mesh>>>({});
  const lastTimeRef = useRef(Date.now());

  // Calculate speedFactor to make Earth's orbit 1 minute long
  const earthOrbitalPeriod = 1; // Earth's orbital period in our scale
  const desiredEarthOrbitTime = 60; // 60 seconds = 1 minute
  const speedFactor = earthOrbitalPeriod / desiredEarthOrbitTime;

  const currentYear = new Date().getFullYear();

  const planetsData = [
    { name: "Mercury", distance: 2, size: 0.034, texture: "/textures/mercury.jpg", orbitalPeriod: 0.24, gravity: 3.7, yearLength: "88 Earth days", funFact: "Mercury has the most eccentric orbit of all planets" },
    { name: "Venus", distance: 3, size: 0.084, texture: "/textures/venus.jpg", orbitalPeriod: 0.62, gravity: 8.87, yearLength: "225 Earth days", funFact: "Venus rotates backwards compared to most planets" },
    { name: "Earth", distance: 5, size: 0.089, texture: "/textures/earth.jpg", orbitalPeriod: 1, gravity: 9.81, yearLength: "365.25 days", funFact: "Earth is the only known planet with active plate tectonics" },
    { name: "Mars", distance: 7, size: 0.047, texture: "/textures/mars.jpg", orbitalPeriod: 1.88, gravity: 3.71, yearLength: "687 Earth days", funFact: "Mars has the largest dust storms in our solar system" },
    { name: "Jupiter", distance: 12, size: 1, texture: "/textures/jupiter.jpg", orbitalPeriod: 11.86, gravity: 24.79, yearLength: "12 Earth years", funFact: "Jupiter's Great Red Spot is a storm that has lasted over 400 years" },
    { name: "Saturn", distance: 18, size: 0.83, texture: "/textures/saturn.jpg", orbitalPeriod: 29.46, gravity: 10.44, yearLength: "29 Earth years", funFact: "Saturn's rings are made mostly of ice and rock" },
    { name: "Uranus", distance: 22, size: 0.36, texture: "/textures/uranus.jpg", orbitalPeriod: 84.01, gravity: 8.69, yearLength: "84 Earth years", funFact: "Uranus rotates on its side, with its axis tilted 98 degrees" },
    { name: "Neptune", distance: 30, size: 0.35, texture: "/textures/neptune.jpg", orbitalPeriod: 164.79, gravity: 11.15, yearLength: "165 Earth years", funFact: "Neptune has the strongest winds in the solar system" },
    { name: "Pluto", distance: 40, size: 0.016, texture: "/textures/pluto.jpg", orbitalPeriod: 248.09, gravity: 0.62, yearLength: "248 Earth years", funFact: "Pluto is smaller than Earth's moon" },
  ];

  useEffect(() => {
    if (focusedPlanet) {
      setIsPaused(true);
      lastTimeRef.current = Date.now();
    } else {
      setIsPaused(false);
    }
  }, [focusedPlanet]);

  const handleUnfocus = () => {
    setFocusedPlanet(null);
    setIsPaused(false);
  };

  // Initialize refs for each planet
  planetsData.forEach(planet => {
    if (!planetRefs.current[planet.name]) {
      planetRefs.current[planet.name] = React.createRef<Mesh>();
    }
  });

  return (
    <>
      <Canvas style={{ width: '100vw', height: '100vh' }}>
        <PerspectiveCamera makeDefault position={[-10, 3, 10]} fov={50} />
        <ambientLight intensity={0.5} />
        <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade={false} />
        {!focusedPlanet && <OrbitControls ref={controlsRef} />}
        <GlowingSun position={[0, 0, 0]} intensity={15} />
        {planetsData.map((planet) => (
          <React.Fragment key={planet.name}>
            <OrbitLine radius={planet.distance} />
            <OrbitMarker distance={planet.distance} />
            <Planet 
              ref={planetRefs.current[planet.name]}
              {...planet} 
              speedFactor={speedFactor} 
              isPaused={isPaused}
              isFocused={focusedPlanet === planet.name}
              onFocus={() => setFocusedPlanet(planet.name)}
            />
          </React.Fragment>
        ))}
        <CameraController 
          focusedPlanet={focusedPlanet} 
          planetsData={planetsData} 
          planetRefs={planetRefs.current}
        />
      </Canvas>
      <YearCounter 
        startYear={currentYear} 
        earthOrbitTime={desiredEarthOrbitTime} 
        isPaused={isPaused}
        lastPausedTime={lastTimeRef.current}
      />
      {focusedPlanet && (
        <>
          <PlanetInfo
            planet={planetsData.find(p => p.name === focusedPlanet) || undefined}
            position="left"
          />
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 1000,
          }}>
            <button
              onClick={handleUnfocus}
              style={{
                fontSize: '14px',
                padding: '10px 15px',
                background: 'rgba(255, 255, 255, 0.7)',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
                fontWeight: 'bold',
                color: '#333',
              }}
            >
              Return to Solar System
            </button>
          </div>
        </>
      )}
    </>
  );
};

SolarSystem.displayName = 'SolarSystem';

export default SolarSystem;