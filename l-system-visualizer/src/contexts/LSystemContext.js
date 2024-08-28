import React, { createContext, useState } from 'react';

export const LSystemContext = createContext();

const presetSystems = {
  sierpinskiCarpet: {
    name: "Sierpinski Carpet",
    axiom: "F",
    rules: { F: "F+F-F-F-G+F+F+F-F", G: "GGG" },
    angle: 90,
    iterations: 3
  },
  kochCurve: {
    name: "Koch Curve",
    axiom: "F",
    rules: { F: "F+F-F-F+F" },
    angle: 60,
    iterations: 4
  },
  kochSnowflake: {
    name: "Koch Snowflake",
    axiom: "F++F++F",
    rules: { F: "F-F++F-F" },
    angle: 60,
    iterations: 4
  },
  mooreFractal: {
    name: "Moore Fractal",
    axiom: "LFL+F+LFL",
    rules: { L: "-RF+LFL+FR-", R: "+LF-RFR-FL+" },
    angle: 90,
    iterations: 3
  },
  binaryTree: {
    name: "Fractal Binary Tree",
    axiom: "0",
    rules: { "1": "11", "0": "1[0]0" },
    angle: 45,
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
  const [lSystem, setLSystem] = useState(presetSystems.sierpinskiCarpet);
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
