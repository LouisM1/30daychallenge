import React from 'react';
import SortingVisualizer from './SortingVisualizer';

function App() {
  return (
    <div className="App" style={{ textAlign: 'center', padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>Sorting Algorithms Visualizer</h1>
      <SortingVisualizer />
    </div>
  );
}

export default App;
