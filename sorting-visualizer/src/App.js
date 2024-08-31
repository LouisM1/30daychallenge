import React from 'react';
import SortingVisualizer from './SortingVisualizer';

function App() {
  return (
    <div className="App" style={{ padding: '20px' }}>
      <h1 style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', textAlign: 'center' }}>Sorting Algorithms Visualizer</h1>
      <SortingVisualizer />
    </div>
  );
}

export default App;
