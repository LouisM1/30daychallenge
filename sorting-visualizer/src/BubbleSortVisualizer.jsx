import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import './BubbleSortVisualizer.css';

const BubbleSortVisualizer = () => {
  const svgRef = useRef();
  const [data, setData] = useState([]);
  const [sorting, setSorting] = useState(false);

  useEffect(() => {
    setData(Array.from({length: 20}, () => Math.floor(Math.random() * 100) + 1));
  }, []);

  useEffect(() => {
    if (!data.length) return;
    drawChart();
  }, [data]);

  const drawChart = () => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const x = d3.scaleBand()
      .range([margin.left, width - margin.right])
      .padding(0.1)
      .domain(data.map((_, i) => i));

    const y = d3.scaleLinear()
      .range([height - margin.bottom, margin.top])
      .domain([0, d3.max(data)]);

    svg.selectAll(".bar")
      .data(data)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d, i) => x(i))
      .attr("y", d => y(d))
      .attr("width", x.bandwidth())
      .attr("height", d => height - margin.bottom - y(d));
  };

  const bubbleSort = async () => {
    setSorting(true);
    let arr = [...data];
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
          await swap(j, j + 1, arr);
        }
      }
    }
    setSorting(false);
  };

  const swap = async (i, j, arr) => {
    [arr[i], arr[j]] = [arr[j], arr[i]];
    setData([...arr]);
    await new Promise(resolve => setTimeout(resolve, 100));
  };

  return (
    <div>
      <svg ref={svgRef} width="600" height="400"></svg>
      <button onClick={bubbleSort} disabled={sorting}>
        {sorting ? 'Sorting...' : 'Start Sort'}
      </button>
    </div>
  );
};

export default BubbleSortVisualizer;