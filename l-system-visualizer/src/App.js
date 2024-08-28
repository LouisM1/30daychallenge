import React from 'react';
import './App.css';
import LSystemVisualizer from './components/LSystemVisualizer';
import ControlPanel from './components/ControlPanel';
import Gallery from './components/Gallery';
import { LSystemProvider } from './contexts/LSystemContext';

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
            <LSystemVisualizer />
          </div>
        </div>
      </LSystemProvider>
    </div>
  );
}

export default App;
