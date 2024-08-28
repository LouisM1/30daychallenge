import React, { useContext, useEffect, useRef } from 'react';
import { LSystemContext } from '../contexts/LSystemContext';

const LSystemVisualizer = () => {
  const { lSystem, visualParams } = useContext(LSystemContext);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Implement drawing logic here using lSystem and visualParams
  }, [lSystem, visualParams]);

  return <canvas ref={canvasRef} width="800" height="600" />;
};

export default LSystemVisualizer;
