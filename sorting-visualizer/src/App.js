import React, { useState } from 'react';
import BubbleSortVisualizer from './BubbleSortVisualizer';

function App() {
  const [visualizerKey, setVisualizerKey] = useState(0);

  const resetVisualizer = () => {
    setVisualizerKey(prevKey => prevKey + 1);
  };

  return (
    <div className="App">
      <h1>Bubble Sort Visualizer</h1>
      <BubbleSortVisualizer key={visualizerKey} />
      <button onClick={resetVisualizer} style={{ marginTop: '10px' }}>Reset</button>
    </div>
  );
}

export default App;
