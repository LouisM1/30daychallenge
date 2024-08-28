import React, { createContext, useState } from 'react';

export const LSystemContext = createContext();

export const LSystemProvider = ({ children }) => {
  const [lSystem, setLSystem] = useState({
    axiom: 'F',
    rules: { F: 'F+F-F-F+F' },
    angle: 90,
    iterations: 4,
  });

  const [visualParams, setVisualParams] = useState({
    lineColor: '#000000',
    lineThickness: 1,
    zoom: 1,
  });

  return (
    <LSystemContext.Provider value={{ lSystem, setLSystem, visualParams, setVisualParams }}>
      {children}
    </LSystemContext.Provider>
  );
};
