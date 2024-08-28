import React from 'react';
import './App.css';
import LSystemVisualizer from './components/LSystemVisualizer';
import ControlPanel from './components/ControlPanel';
import Gallery from './components/Gallery';
import { LSystemProvider } from './contexts/LSystemContext';

function App() {
  return (
    <div className="App">
      <h1>L-System Visualizer</h1>
      <LSystemProvider>
        <div className="main-content">
          <LSystemVisualizer />
          <ControlPanel />
        </div>
        <Gallery />
      </LSystemProvider>
    </div>
  );
}

export default App;
