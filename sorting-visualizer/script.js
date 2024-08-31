const width = 600;
const height = 400;
const margin = { top: 20, right: 20, bottom: 30, left: 40 };

const svg = d3.select("svg");
const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

let data = Array.from({length: 20}, () => Math.floor(Math.random() * 100) + 1);
const x = d3.scaleBand().range([0, width - margin.left - margin.right]).padding(0.1);
const y = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);

x.domain(data.indices());
y.domain([0, d3.max(data)]);

chart.selectAll(".bar")
    .data(data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", (d, i) => x(i))
    .attr("y", d => y(d))
    .attr("width", x.bandwidth())
    .attr("height", d => height - margin.top - margin.bottom - y(d));

async function bubbleSort() {
    for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data.length - i - 1; j++) {
            if (data[j] > data[j + 1]) {
                await swap(j, j + 1);
            }
        }
    }
}

async function swap(i, j) {
    [data[i], data[j]] = [data[j], data[i]];
    
    chart.selectAll(".bar")
        .data(data)
        .transition()
        .duration(50)
        .attr("x", (d, i) => x(i))
        .attr("y", d => y(d))
        .attr("height", d => height - margin.top - margin.bottom - y(d));
    
    chart.selectAll(".bar")
        .classed("swapping", (d, index) => index === i || index === j);
    
    await new Promise(resolve => setTimeout(resolve, 100));
    
    chart.selectAll(".bar").classed("swapping", false);
}

function startSort() {
    bubbleSort();
}