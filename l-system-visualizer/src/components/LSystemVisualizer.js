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

    ctx.clearRect(0, 0, width, height);
    const lSystemString = generateLSystem(lSystem.axiom, lSystem.rules, lSystem.iterations);

    ctx.strokeStyle = visualParams.lineColor;
    ctx.lineWidth = visualParams.lineThickness;
    ctx.beginPath();

    let x, y, angle;
    const stack = [];
    let stepSize = 5 * visualParams.zoom;

    switch (lSystem.name) {
      case "Sierpinski Carpet":
      case "Koch Curve":
      case "Koch Snowflake":
      case "Moore Fractal":
      case "Sierpinski Triangle":
      case "Dragon Curve":
      case "Fractal Plant":
        x = width / 2;
        y = height / 2;
        angle = 0;
        for (const char of lSystemString) {
          switch (char) {
            case 'F':
            case 'G':
              ctx.moveTo(x, y);
              x += Math.cos(angle * Math.PI / 180) * stepSize;
              y += Math.sin(angle * Math.PI / 180) * stepSize;
              ctx.lineTo(x, y);
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
            case 'L':
            case 'R':
            case 'X':
            case 'Y':
              // These characters don't affect drawing
              break;
          }
        }
        break;
      case "Fractal Binary Tree":
        x = width / 2;
        y = height;
        angle = -90;
        for (const char of lSystemString) {
          switch (char) {
            case '0':
            case '1':
              ctx.moveTo(x, y);
              x += Math.cos(angle * Math.PI / 180) * stepSize;
              y += Math.sin(angle * Math.PI / 180) * stepSize;
              ctx.lineTo(x, y);
              break;
            case '[':
              stack.push({ x, y, angle });
              angle -= lSystem.angle;
              break;
            case ']':
              const state = stack.pop();
              x = state.x;
              y = state.y;
              angle = state.angle + lSystem.angle;
              break;
          }
        }
        break;
    }

    ctx.stroke();
  }, [lSystem, visualParams]);

  return <canvas ref={canvasRef} width="800" height="600" />;
};

export default LSystemVisualizer;
