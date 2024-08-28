import React, { useContext, useEffect, useRef, useState } from 'react';
import { LSystemContext } from '../contexts/LSystemContext';
import { generateLSystem } from '../utils/LSystemGenerator';

const LSystemVisualizer = () => {
  const { lSystem, visualParams } = useContext(LSystemContext);
  const canvasRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      const newOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setOffset(newOffset);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);
    const lSystemString = generateLSystem(lSystem.axiom, lSystem.rules, lSystem.iterations);

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = visualParams.lineThickness;
    ctx.beginPath();

    let x, y, angle;
    const stack = [];
    let stepSize = 5 * visualParams.zoom;

    const drawLine = (x1, y1, x2, y2) => {
      ctx.moveTo(x1 + offset.x, y1 + offset.y);
      ctx.lineTo(x2 + offset.x, y2 + offset.y);
    };

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
              const newX = x + Math.cos(angle * Math.PI / 180) * stepSize;
              const newY = y + Math.sin(angle * Math.PI / 180) * stepSize;
              drawLine(x, y, newX, newY);
              x = newX;
              y = newY;
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
              const newX = x + Math.cos(angle * Math.PI / 180) * stepSize;
              const newY = y + Math.sin(angle * Math.PI / 180) * stepSize;
              drawLine(x, y, newX, newY);
              x = newX;
              y = newY;
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
  }, [lSystem, visualParams, offset]);

  return (
    <canvas
      ref={canvasRef}
      width="800"
      height="600"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    />
  );
};

export default LSystemVisualizer;
