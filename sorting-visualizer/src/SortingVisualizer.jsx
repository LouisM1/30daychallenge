import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './SortingVisualizer.css';
import { algorithms } from './sortingAlgorithms';

const SortingVisualizer = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState(false);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubbleSort');

  useEffect(() => {
    resetData();
  }, []);

  useEffect(() => {
    if (!data.length) return;
    drawChart();
  }, [data]);

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
    await algorithms[selectedAlgorithm](data, setData);
    setSorting(false);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <svg ref={svgRef} width="1000" height="500"></svg>
      <br />
      <select 
        value={selectedAlgorithm} 
        onChange={(e) => setSelectedAlgorithm(e.target.value)}
        style={{ marginRight: '10px' }}
      >
        {Object.keys(algorithms).map(algo => (
          <option key={algo} value={algo}>{algo}</option>
        ))}
      </select>
      <button onClick={runSort} disabled={sorting}>
        {sorting ? 'Sorting...' : 'Start Sort'}
      </button>
      <button onClick={resetData} disabled={sorting} style={{ marginLeft: '10px' }}>
        Reset Data
      </button>
    </div>
  );
};

export default SortingVisualizer;