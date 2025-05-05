import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import '../../css/charts/Heatmap.css';

const Heatmap = ({ dataMap, selectedK, selectedSubOption }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    d3.select(containerRef.current).selectAll('*').remove();

    const data = dataMap.filtered?.filter(d => d.k === selectedK) || [];
    if (data.length === 0) return;

    const margin = { top: 100, right: 100, bottom: 150, left: 100 };
    const cellSize = 25;

    const parseTimestamp = d =>
      new Date(`${d.year}-${String(d.month).padStart(2, '0')}-01T${d.time}`);

    const timestamps = data.map(parseTimestamp);
    const phaseNos = Array.from(new Set(data.map(d => d.phaseNo))).sort((a, b) => a - b);

    const width = 1000; 
    const height = phaseNos.length * cellSize + 15; // Add buffer to shift upward slightly

    const container = d3.select(containerRef.current)
      .append('div')
      .attr('class', 'heatmap-block');

    container.append('h3').text(`${selectedSubOption}`);

    const svg = container.append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom + 25) // can increase to +80 if needed
      .style('background-color', '#f5f5f5');

    // Main group
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleTime()
      .domain(d3.extent(timestamps))
      .range([0, width]);

    const y = d3.scaleBand()
      .domain(phaseNos)
      .range([0, height])
      .padding(0.05);

    const colorScale = d3.scaleOrdinal()
      .domain([0, 1])
      .range(['#27ae60', '#cb4335']);

    // Clip path
    svg.append('defs').append('clipPath')
      .attr('id', 'heatmap-clip')
      .append('rect')
      .attr('width', width)
      .attr('height', height);

    // Zoomable rect group
    const zoomableGroup = g.append('g')
      .attr('clip-path', 'url(#heatmap-clip)');

    const timeDiff = (timestamps[1] - timestamps[0]) || 3600000;
    const timeWidth = x(new Date(timestamps[0].getTime() + timeDiff)) - x(timestamps[0]);
    
    zoomableGroup.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', d => x(parseTimestamp(d)) - timeWidth * 0.45)
      .attr('y', d => y(d.phaseNo))
      .attr('width', timeWidth * 0.9)
      .attr('height', y.bandwidth())
      .attr('fill', d => colorScale(d.recommend));

    // Y-axis (phase numbers)
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d => `Phase ${d}`))
      .selectAll('text')
      .style('font-size', '13px')
      .style('font-family', 'Arial, sans-serif')
      .style('fill', '#000');

    // Independent x-axis group (not zoomed)
    const xAxisGroup = svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(${margin.left}, ${margin.top + height})`);

    const updateXAxis = scale => {
      xAxisGroup.call(d3.axisBottom(scale).ticks(8).tickFormat(d3.timeFormat('%Y-%m %H:%M')))
        .selectAll('text')
        .style('font-size', '13px')
        .attr('transform', 'rotate(-30)')
        .style('font-family', 'Arial, sans-serif')
        .style('text-anchor', 'end');
    };

    updateXAxis(x); // initial draw

    // Zoom behavior
    const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .translateExtent([[-width*0.25, 0], [width * 1.25, height]])  // allows full pan/zoom
      .extent([[0, 0], [width, height]])
      .on('zoom', (event) => {
        const newX = event.transform.rescaleX(x);
      
        // Compute dynamic bar width after zooming
        const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
        const timeDiff = sortedTimestamps[1] - sortedTimestamps[0] || 3600000;
        const newBarWidth = newX(new Date(sortedTimestamps[0].getTime() + timeDiff)) - newX(sortedTimestamps[0]);
      
        // Apply new x position and dynamic width
        zoomableGroup.selectAll('rect')
          .attr('x', d => newX(parseTimestamp(d)) - newBarWidth * 0.45)
          .attr('width', newBarWidth * 0.9); // 90% fill
      
        updateXAxis(newX);
      });      

    svg.call(zoom);

    // Zoom toolbar
    const toolbar = g.append('g')
      .attr('class', 'zoom-toolbar')
      .attr('transform', `translate(${width - 160}, -60)`);

    const iconPaths = {
      zoomIn: "M14 2v24M2 14h24",
      zoomOut: "M2 14h24",
      reset: "M4 14a10 10 0 1 1 2 6l-2-6h6",
      download: "M12 2v14m0 0l-4-4m4 4l4-4M4 22h16"
    };

    const buttonData = [
      {
        key: "zoomIn", title: "Zoom In", onClick: () =>
          svg.transition().call(zoom.scaleBy, 2)
      },
      {
        key: "zoomOut", title: "Zoom Out", onClick: () =>
          svg.transition().call(zoom.scaleBy, 0.5)
      },
      {
        key: "reset", title: "Reset Zoom", onClick: () =>
          svg.transition().call(zoom.transform, d3.zoomIdentity)
      },
      {
        key: "download", title: "Download SVG", onClick: () => {
          const serializer = new XMLSerializer();
          const source = serializer.serializeToString(svg.node());
          const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${selectedSubOption}_heatmap.svg`;
          link.click();
          URL.revokeObjectURL(url);
        }
      }
    ];

    buttonData.forEach((btn, i) => {
      const group = toolbar.append('g')
        .attr('class', 'zoom-button')
        .attr('transform', `translate(${i * 38}, 0)`)
        .style('cursor', 'pointer')
        .on('click', btn.onClick);

      group.append('rect')
        .attr('width', 28)
        .attr('height', 28)
        .attr('class', 'zoom-btn-rect');

      group.append('path')
        .attr('d', iconPaths[btn.key])
        .attr('transform', 'translate(4,4) scale(0.75)')
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('fill', 'none')
        .attr('stroke-linecap', 'round');

      group.append('title').text(btn.title);
    });

    // ✅ Legend placed lower and right-aligned
    const legendGroup = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${margin.left + width - 300}, ${margin.top + height + 75})`);

    const legendItems = [
      { label: 'Not Recommended', color: '#27ae60' },
      { label: 'Recommended', color: '#cb4335' }
    ];

    legendItems.forEach((item, i) => {
      const legend = legendGroup.append('g')
        .attr('transform', `translate(${i * 175}, 0)`);

      legend.append('rect')
        .attr('width', 20)
        .attr('height', 20)
        .attr('fill', item.color)
        .attr('stroke', '#333');

      legend.append('text')
        .attr('x', 30)
        .attr('y', 15)
        .style('font-size', '14px')
        .style('fill', '#333')
        .text(item.label);
    });

  }, [dataMap, selectedK, selectedSubOption]);

  return <div ref={containerRef} />;
};

export default Heatmap;
