import React, { useContext, useEffect, useRef } from 'react';
import { LSystemContext } from '../contexts/LSystemContext';
import { generateLSystem } from '../utils/LSystemGenerator';

const LSystemVisualizer = () => {
  const { lSystem, visualParams } = useContext(LSystemContext);
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear the canvas
    ctx.clearRect(0, 0, width, height);

    // Generate the L-system string
    const lSystemString = generateLSystem(lSystem.axiom, lSystem.rules, lSystem.iterations);

    // Set up initial drawing state
    ctx.strokeStyle = visualParams.lineColor;
    ctx.lineWidth = visualParams.lineThickness;
    ctx.beginPath();

    // Set up the turtle graphics state
    let x = width / 2;
    let y = height / 2;
    let angle = -90; // Start pointing upwards
    const stack = [];
    const stepSize = 5 * visualParams.zoom;

    // Draw the L-system
    for (const char of lSystemString) {
      switch (char) {
        case 'F':
        case 'A':
        case 'B':
        case '0':
        case '1':
          const newX = x + Math.cos(angle * Math.PI / 180) * stepSize;
          const newY = y + Math.sin(angle * Math.PI / 180) * stepSize;
          ctx.moveTo(x, y);
          ctx.lineTo(newX, newY);
          x = newX;
          y = newY;
          break;
        case 'G':
          x += Math.cos(angle * Math.PI / 180) * stepSize;
          y += Math.sin(angle * Math.PI / 180) * stepSize;
          break;
        case '+':
          angle += lSystem.angle;
          break;
        case '-':
          angle -= lSystem.angle;
          break;
        case '[':
          stack.push({ x, y, angle });
          break;
        case ']':
          const state = stack.pop();
          x = state.x;
          y = state.y;
          angle = state.angle;
          break;
        case 'X':
        case 'Y':
          // Do nothing for these symbols
          break;
      }
    }

    ctx.stroke();
  }, [lSystem, visualParams]);

  return <canvas ref={canvasRef} width="800" height="600" />;
};

export default LSystemVisualizer;
