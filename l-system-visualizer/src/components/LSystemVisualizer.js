import React, { useContext, useEffect, useRef, useState, useCallback } from 'react';
import { LSystemContext } from '../contexts/LSystemContext';
import { generateLSystem } from '../utils/LSystemGenerator';

const LSystemVisualizer = () => {
  const { lSystem, visualParams } = useContext(LSystemContext);
  const canvasRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [animationProgress, setAnimationProgress] = useState(0);
  const animationRef = useRef(null);

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

  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = 1 - e.deltaY * 0.001;
    setZoom(prevZoom => Math.max(0.1, Math.min(10, prevZoom * zoomFactor)));
  };

  const cancelAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  useEffect(() => {
    cancelAnimation();
    clearCanvas();
    setAnimationProgress(0);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const { width, height } = canvas;

    const lSystemString = generateLSystem(lSystem.axiom, lSystem.rules, lSystem.iterations);

    const { minX, maxX, minY, maxY } = calculateBoundingBox(lSystemString);

    const patternWidth = maxX - minX;
    const patternHeight = maxY - minY;
    const scale = Math.min(width / patternWidth, height / patternHeight) * 0.8 * zoom;
    const startX = width / 2 - (patternWidth * scale) / 2 - minX * scale;
    const startY = height / 2 - (patternHeight * scale) / 2 - minY * scale;

    let x = startX, y = startY, angle = -90;
    const stack = [];
    const stepSize = 5 * visualParams.zoom * scale;

    let currentIndex = 0;
    const totalSteps = lSystemString.length;

    const animate = () => {
      ctx.strokeStyle = visualParams.lineColor;
      ctx.lineWidth = visualParams.lineThickness;
      ctx.beginPath();

      const stepsPerFrame = Math.max(1, Math.floor(totalSteps / 100));
      for (let step = 0; step < stepsPerFrame && currentIndex < totalSteps; step++) {
        const char = lSystemString[currentIndex];
        switch (char) {
          case 'F':
          case 'G':
          case '0':
          case '1':
            const newX = x + Math.cos(angle * Math.PI / 180) * stepSize;
            const newY = y + Math.sin(angle * Math.PI / 180) * stepSize;
            ctx.moveTo(x + offset.x, y + offset.y);
            ctx.lineTo(newX + offset.x, newY + offset.y);
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
            if (lSystem.name === "Fractal Binary Tree") {
              angle -= lSystem.angle;
            }
            break;
          case ']':
            const state = stack.pop();
            x = state.x;
            y = state.y;
            angle = state.angle;
            ctx.moveTo(x + offset.x, y + offset.y);
            if (lSystem.name === "Fractal Binary Tree") {
              angle += lSystem.angle;
            }
            break;
        }
        currentIndex++;
      }
      ctx.stroke();

      setAnimationProgress(currentIndex / totalSteps);

      if (currentIndex < totalSteps) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimation();
    };
  }, [lSystem, visualParams, offset, zoom, cancelAnimation, clearCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
      };
    }
  }, []);

  const calculateBoundingBox = (lSystemString) => {
    let x = 0, y = 0, minX = 0, maxX = 0, minY = 0, maxY = 0;
    let angle = -90;  // Start with -90 degrees (pointing up)
    const stack = [];
    const stepSize = 5;

    for (const char of lSystemString) {
      switch (char) {
        case 'F':
        case 'G':
        case '0':
        case '1':
          x += Math.cos(angle * Math.PI / 180) * stepSize;
          y += Math.sin(angle * Math.PI / 180) * stepSize;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
          break;
        case '+':
          angle += lSystem.angle;
          break;
        case '-':
          angle -= lSystem.angle;
          break;
        case '[':
          stack.push({ x, y, angle });
          if (lSystem.name === "Fractal Binary Tree") {
            angle -= lSystem.angle;
          }
          break;
        case ']':
          const state = stack.pop();
          x = state.x;
          y = state.y;
          angle = state.angle;
          if (lSystem.name === "Fractal Binary Tree") {
            angle += lSystem.angle;
          }
          break;
      }
    }

    return { minX, maxX, minY, maxY };
  };

  return (
    <div className="visualizer-container">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{ 
          cursor: isDragging ? 'grabbing' : 'grab',
          width: '100%',
          height: '100%'
        }}
      />
      <div className="progress-bar" style={{ width: `${animationProgress * 100}%` }}></div>
    </div>
  );
};

export default LSystemVisualizer;