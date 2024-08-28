import React, { useState } from 'react';
import './App.css';
import LSystemVisualizer from './components/LSystemVisualizer';
import ControlPanel from './components/ControlPanel';
import Gallery from './components/Gallery';
import { LSystemProvider } from './contexts/LSystemContext';

const InfoButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="info-button-container">
      <button className="info-button" onClick={() => setIsOpen(!isOpen)}>
        What is all this stuff?
      </button>
      {isOpen && (
        <div className="info-dropdown">
          <h3>L-Systems Explained</h3>
          <p>An L-System (Lindenmayer System) is a parallel rewriting system and a type of formal grammar. It consists of an alphabet of symbols, a collection of production rules that expand each symbol into some larger string of symbols, an initial "axiom" string from which to begin construction, and a mechanism for translating the generated strings into geometric structures.</p>
          <p>Key components:</p>
          <ul>
            <li><strong>Axiom:</strong> The initial state of the system.</li>
            <li><strong>Rules:</strong> Define how each symbol should be replaced in each iteration.</li>
            <li><strong>Iterations:</strong> The number of times the rules are applied.</li>
            <li><strong>Angle:</strong> Used in interpreting the L-System as a geometric structure.</li>
          </ul>
          <p>L-Systems can model the growth processes of plant development and generate self-similar fractals.</p>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <LSystemProvider>
        <div className="main-content">
          <div className="left-panel">
            <h1>L-System Visualizer</h1>
            <ControlPanel />
            <Gallery />
          </div>
          <div className="right-panel">
            <InfoButton />
            <LSystemVisualizer />
          </div>
        </div>
      </LSystemProvider>
    </div>
  );
}

export default App;
