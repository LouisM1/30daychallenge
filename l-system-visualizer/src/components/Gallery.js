import React, { useContext } from 'react';
import { LSystemContext } from '../contexts/LSystemContext';

const Gallery = () => {
  const { setLSystem, setVisualParams } = useContext(LSystemContext);

  const exampleSystems = [
    // Define example L-systems here
  ];

  return (
    <div className="gallery">
      <h2>Example L-Systems</h2>
      {exampleSystems.map((system, index) => (
        <button key={index} onClick={() => {
          setLSystem(system.lSystem);
          setVisualParams(system.visualParams);
        }}>
          {system.name}
        </button>
      ))}
    </div>
  );
};

export default Gallery;
