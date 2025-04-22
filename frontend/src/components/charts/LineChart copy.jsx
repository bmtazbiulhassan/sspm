import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const LineChart = ({ data }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1000);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length === 0) return;
      const { width } = entries[0].contentRect;
      setContainerWidth(width);
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    d3.select(containerRef.current).selectAll('*').remove();

    const margin = { top: 80, right: 30, bottom: 150, left: 100 };
    const width = containerWidth - margin.left - margin.right;
    const height = 500 - margin.top;

    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', containerWidth)
      .attr('height', height + margin.top + margin.bottom)
      .style('background-color', '#f5f5f5');

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const parseTime = d3.isoParse;
    const allKeys = Array.from(new Set(data.map(d => d.series || 'default')));
    const color = d3.scaleOrdinal(d3.schemeCategory10).domain(allKeys);

    const seriesData = allKeys.map(key => ({
      key,
      values: data.filter(d => d.series === key || (!d.series && key === 'default'))
        .map(d => ({
          ...d,
          time: parseTime(d.timeStamp),
          value: +d.mean
        }))
        .sort((a, b) => d3.ascending(a.time, b.time))
    }));

    const x = d3.scaleTime()
      .domain(d3.extent(data.map(d => parseTime(d.timeStamp))))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => +d.mean)]).nice()
      .range([height, 0]);

    const xAxis = g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.timeFormat('%Y-%m-%d %H:%M')).ticks(6))
      .selectAll('text')
      .style('font-size', '14px')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d3.format('.0f')))
      .selectAll('text')
      .style('font-size', '14px');

    const line = d3.line()
      .x(d => x(d.time))
      .y(d => y(d.value));

    const lineGroup = g.append('g').attr('class', 'lines');

    seriesData.forEach(series => {
      lineGroup.append('path')
        .datum(series.values)
        .attr('fill', 'none')
        .attr('stroke', color(series.key))
        .attr('stroke-width', 2)
        .attr('d', line);
    });

    // Brush
    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("end", (event) => {
        if (!event.selection) return;
        const [x0, x1] = event.selection.map(x.invert);
        x.domain([x0, x1]);
        g.select('.x-axis').call(d3.axisBottom(x));
        g.selectAll('path').attr('d', d => line(d.values));
        g.select('.brush').call(brush.move, null); // Clear brush
      });

    g.append("g")
      .attr("class", "brush")
      .call(brush);

    // Chart Title
    g.append('text')
      .attr('x', width / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .text(`Trendline of ${data[0]?.featureName || 'Feature'}`);

    // Axis Labels
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('x', width / 2)
      .attr('y', height + 130)
      .style('font-size', '16px')
      .text('Time (YYYY-MM-DD HH:MM)');

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -70)
      .style('font-size', '16px')
      .text(`${data[0]?.featureName || 'Value'}`);

    // Zoom Controls
    const zoomIn = () => {
      const [start, end] = x.domain();
      const range = end - start;
      const mid = new Date(start.getTime() + range / 2);
      x.domain([new Date(mid.getTime() - range / 4), new Date(mid.getTime() + range / 4)]);
      g.select('.x-axis').call(d3.axisBottom(x));
      lineGroup.selectAll('path').attr('d', d => line(d.values));
    };

    const zoomOut = () => {
      const [start, end] = x.domain();
      const range = end - start;
      const mid = new Date(start.getTime() + range / 2);
      x.domain([new Date(mid.getTime() - range), new Date(mid.getTime() + range)]);
      g.select('.x-axis').call(d3.axisBottom(x));
      lineGroup.selectAll('path').attr('d', d => line(d.values));
    };

    const resetZoom = () => {
      x.domain(d3.extent(data.map(d => parseTime(d.timeStamp))));
      g.select('.x-axis').call(d3.axisBottom(x));
      lineGroup.selectAll('path').attr('d', d => line(d.values));
    };

    // Add buttons outside SVG
    const controls = d3.select(containerRef.current)
      .append('div')
      .style('margin-top', '1rem');

    controls.append('button').text('Zoom In').on('click', zoomIn);
    controls.append('button').text('Zoom Out').on('click', zoomOut);
    controls.append('button').text('Reset Zoom').on('click', resetZoom);
    controls.append('button').text('Download SVG').on('click', () => {
      const svgEl = containerRef.current.querySelector('svg');
      const serializer = new XMLSerializer();
      const source = serializer.serializeToString(svgEl);
      const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'chart.svg';
      link.click();
      URL.revokeObjectURL(url);
    });
  }, [data, containerWidth]);

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative', overflowX: 'auto' }} />
  );
};

export default LineChart;