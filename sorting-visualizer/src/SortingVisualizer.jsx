import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './SortingVisualizer.css';
import { algorithms, setStopFlag } from './sortingAlgorithms';

const algorithmInfo = {
  bubbleSort: {
    description: "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
    ranking: "Slow (O(n²))"
  },
  mergeSort: {
    description: "Divides the unsorted list into n sublists, each containing one element, then repeatedly merges sublists to produce new sorted sublists.",
    ranking: "Fast (O(n log n))"
  },
  quickSort: {
    description: "Picks an element as pivot and partitions the given array around the picked pivot.",
    ranking: "Fast (O(n log n) average, O(n²) worst case)"
  },
  heapSort: {
    description: "Builds a max-heap from the input data, then repeatedly extracts the maximum element and rebuilds the heap.",
    ranking: "Fast (O(n log n))"
  },
  insertionSort: {
    description: "Builds the final sorted array one item at a time, by repeatedly taking the next element and inserting it into its correct position.",
    ranking: "Slow for large lists (O(n²)), fast for small lists"
  },
  selectionSort: {
    description: "Repeatedly selects the smallest (or largest) element from the unsorted portion of the list and moves it to the sorted portion of the list.",
    ranking: "Slow (O(n²))"
  },
  cocktailShakerSort: {
    description: "Variation of bubble sort that sorts in both directions each pass through the list.",
    ranking: "Slow (O(n²))"
  },
  radixSort: {
    description: "Sorts integers by processing each digit, from least significant to most significant.",
    ranking: "Fast for integers (O(nk) where k is the number of digits)"
  },
  combSort: {
    description: "Improves on bubble sort by using gap of more than 1 to eliminate small values near the end of the list.",
    ranking: "Moderate (O(n²/2^p) where p is the number of increments)"
  },
  shellSort: {
    description: "Generalization of insertion sort that allows the exchange of items that are far apart.",
    ranking: "Moderate (O(n log n) to O(n²) depending on gap sequence)"
  },
  bucketSort: {
    description: "Distributes the elements into a number of buckets, then sorts each bucket individually.",
    ranking: "Fast for uniformly distributed data (O(n+k))"
  },
  bogoSort: {
    description: "Randomly permutes its input until it finds a sorted permutation. Not meant for practical use.",
    ranking: "Extremely slow (O(∞) - may never terminate)"
  }
};

const SortingVisualizer = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubbleSort');
  const audioContextRef = useRef(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    resetData();
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!data.length) return;
    drawChart();
    if (isSorted(data) && sorting === false) {
      playSuccessSound();
    }
  }, [data, sorting]);

  const resetData = () => {
    setData(Array.from({length: 100}, (_, i) => i + 1).sort(() => Math.random() - 0.5));
  };

  const drawChart = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 1000;
    const height = 500;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    svg.attr("width", width).attr("height", height);
    svg.attr("style", "background-color: black;");

    const x = d3.scaleBand()
      .range([margin.left, width - margin.right])
      .padding(0.1)
      .domain(data.map((_, i) => i));

    const y = d3.scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain([0, 100]);

    svg.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => x(i))
      .attr("y", d => y(d))
      .attr("width", x.bandwidth())
      .attr("height", d => height - margin.bottom - y(d));
  };

  const runSort = async () => {
    setSorting(true);
    setStopFlag(false);
    await algorithms[selectedAlgorithm](data, setData);
    setSorting(false);
  };

  const stopSort = () => {
    setStopFlag(true);
    setSorting(false);
  };

  const playSuccessSound = () => {
    if (!audioContextRef.current) return;

    const now = audioContextRef.current.currentTime;
    const notes = [60, 64, 67, 72]; // C4, E4, G4, C5 in MIDI note numbers

    notes.forEach((note, index) => {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(440 * Math.pow(2, (note - 69) / 12), now + index * 0.2);

      gainNode.gain.setValueAtTime(0, now + index * 0.2);
      gainNode.gain.linearRampToValueAtTime(0.5, now + index * 0.2 + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + index * 0.2 + 0.3);

      oscillator.start(now + index * 0.2);
      oscillator.stop(now + index * 0.2 + 0.3);
    });
  };

  const isSorted = (arr) => {
    for (let i = 1; i < arr.length; i++) {
      if (arr[i] < arr[i - 1]) return false;
    }
    return true;
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        right: 0, 
        zIndex: 1000
      }}>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
            backgroundColor: 'white',
            color: 'black',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {showInfo ? 'Hide Info' : 'Show Info'}
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div style={{ width: '1000px', textAlign: 'center' }}>
          <svg ref={svgRef} width="1000" height="500" style={{ margin: '0 auto', display: 'block' }}></svg>
          <br />
          <select 
            value={selectedAlgorithm} 
            onChange={(e) => setSelectedAlgorithm(e.target.value)}
            style={{
              marginRight: '10px',
              padding: '10px',
              fontSize: '16px',
              fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
              backgroundColor: 'white',
              color: 'black',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {Object.keys(algorithms).map(algo => (
              <option 
                key={algo} 
                value={algo}
                style={{
                  backgroundColor: 'white',
                  color: 'black'
                }}
              >
                {algo.charAt(0).toUpperCase() + algo.slice(1)}
              </option>
            ))}
          </select>
          <button onClick={runSort} disabled={sorting}>
            {sorting ? 'Sorting...' : 'Start Sort'}
          </button>
          <button onClick={stopSort} disabled={!sorting} style={{ marginLeft: '10px' }}>
            Stop Sort
          </button>
          <button onClick={resetData} disabled={sorting} style={{ marginLeft: '10px' }}>
            Reset Data
          </button>
        </div>
      </div>
      {showInfo && (
        <div style={{ 
          position: 'fixed', 
          right: 0, 
          top: 0, 
          width: '250px', 
          padding: '20px', 
          backgroundColor: '#222', 
          height: '100%',
          overflowY: 'auto',
          boxSizing: 'border-box',
          transition: 'transform 0.3s ease-in-out',
          transform: showInfo ? 'translateX(0)' : 'translateX(100%)'
        }}>
          <h3 style={{ color: 'white', marginTop: '0' }}>{selectedAlgorithm.charAt(0).toUpperCase() + selectedAlgorithm.slice(1)}</h3>
          <p style={{ color: 'white' }}>{algorithmInfo[selectedAlgorithm].description}</p>
          <p style={{ color: 'white' }}>Speed Ranking: {algorithmInfo[selectedAlgorithm].ranking}</p>
        </div>
      )}
    </div>
  );
};

export default SortingVisualizer;