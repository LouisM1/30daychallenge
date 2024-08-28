import React, { createContext, useState } from 'react';

export const LSystemContext = createContext();

const presetSystems = {
  algae: {
    name: "Algae (AB system)",
    axiom: "A",
    rules: { A: "AB", B: "A" },
    angle: 0,
    iterations: 5
  },
  binaryTree: {
    name: "Fractal Binary Tree",
    axiom: "0",
    rules: { "1": "11", "0": "1[0]0" },
    angle: 45,
    iterations: 5
  },
  cantorSet: {
    name: "Cantor Set",
    axiom: "A",
    rules: { A: "ABA", B: "BBB" },
    angle: 0,
    iterations: 5
  },
  sierpinskiTriangle: {
    name: "Sierpinski Triangle",
    axiom: "F-G-G",
    rules: { F: "F-G+F+G-F", G: "GG" },
    angle: 120,
    iterations: 5
  },
  dragonCurve: {
    name: "Dragon Curve",
    axiom: "FX",
    rules: { X: "X+YF+", Y: "-FX-Y" },
    angle: 90,
    iterations: 10
  },
  fractalPlant: {
    name: "Fractal Plant",
    axiom: "X",
    rules: { X: "F-[[X]+X]+F[+FX]-X", F: "FF" },
    angle: 25,
    iterations: 5
  }
};

export const LSystemProvider = ({ children }) => {
  const [lSystem, setLSystem] = useState(presetSystems.algae);
  const [visualParams, setVisualParams] = useState({
    lineColor: '#000000',
    lineThickness: 1,
    zoom: 1,
  });

  return (
    <LSystemContext.Provider value={{ lSystem, setLSystem, visualParams, setVisualParams, presetSystems }}>
      {children}
    </LSystemContext.Provider>
  );
};
