import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

import '../../css/charts/LineChart.css'

const LineChart = ({ data }) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1000);

  const featureNameMap = {
    'volume': 'Volume of Vehicles',
    'occupancy': 'Occupancy (Sec)',
    'splitFailure': 'Split Failure Frequency',
    'gap': 'Gap Frequency',
    'headway': 'Headway (Sec)',
    'conflict': 'Conflict Frequency',
    'runningFlag': 'Red Light Running Frequency',
    'pedestrianActivity': 'Pedestrian Activity Indicator (Binary)',
    'pedestrianDelay': 'Pedestrian Delay (Sec)',
    'conflictPropensity': 'Pedestrian-Vehicle (Right-Turn) Conflict Propensity',
    'duration': 'Duration (Sec)'
  };

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
          value: +('value' in d ? d.value : d.mean)
        }))
        .sort((a, b) => d3.ascending(a.time, b.time))
    }));

    let x = d3.scaleTime()
      .domain(d3.extent(data.map(d => parseTime(d.timeStamp))))
      .range([0, width]);

    let y = d3.scaleLinear()
      .domain([0, d3.max(data, d => +('value' in d ? d.value : d.mean))]).nice()
      .range([height, 0]);

    const xAxisGroup = g.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0,${height})`);

    const yAxisGroup = g.append('g')
      .attr('class', 'y-axis');

    const xGridGroup = g.append('g')
      .attr('class', 'x-grid')
      .attr('transform', `translate(0,${height})`);

    const yGridGroup = g.append('g')
      .attr('class', 'y-grid');

    const lineGroup = g.append('g').attr('class', 'lines');

    svg.append("defs").append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height);

    lineGroup.attr("clip-path", "url(#clip)");

    const brush = d3.brushX()
      .extent([[0, 0], [width, height]])
      .on("end", (event) => {
        if (!event.selection) return;
        const [x0, x1] = event.selection.map(x.invert);
        x.domain([x0, x1]);
        drawChart();
        g.select('.brush').call(brush.move, null);
      });

    const drawChart = () => {
      const visibleTimeRange = x.domain();

      const visibleValues = seriesData.flatMap(series =>
        series.values.filter(d => d.time >= visibleTimeRange[0] && d.time <= visibleTimeRange[1])
      );

      y.domain([0, d3.max(visibleValues, d => +('value' in d ? d.value : d.mean))]).nice();

      brush.extent([[0, 0], [width, height]]);
      g.select('.brush').call(brush);

      const xAxis = d3.axisBottom(x).tickFormat(d3.timeFormat('%Y-%m-%d %H:%M')).ticks(6);
      const yAxis = d3.axisLeft(y).tickFormat(d3.format('.0f'));
      const xGrid = d3.axisBottom(x).tickSize(-height).tickFormat("");
      const yGrid = d3.axisLeft(y).tickSize(-width).tickFormat("");

      xAxisGroup.call(xAxis).selectAll('text')
        .style('font-size', '14px')
        .attr('transform', 'rotate(-45)')
        .style('text-anchor', 'end');

      yAxisGroup.call(yAxis).selectAll('text')
        .style('font-size', '14px');

      xGridGroup.call(xGrid)
        .selectAll('line')
        .style('stroke', '#ddd')
        .style('stroke-dasharray', '2,2');

      yGridGroup.call(yGrid)
        .selectAll('line')
        .style('stroke', '#ddd')
        .style('stroke-dasharray', '2,2');

      lineGroup.selectAll('path').remove();

      const line = d3.line()
        .x(d => x(d.time))
        .y(d => y(d.value));

      seriesData.forEach(series => {
        lineGroup.append('path')
          .datum(series.values)
          .attr('fill', 'none')
          .attr('stroke', color(series.key))
          .attr('stroke-width', 2)
          .attr('d', line);
      });
    };

    drawChart();

    g.append("g")
      .attr("class", "brush")
      .call(brush);

    g.append('text')
      .attr('x', width / 2)
      .attr('y', -30)
      .attr('text-anchor', 'middle')
      .style('font-size', '20px')
      .style('font-weight', 'bold')
      .text('Trendline');

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
      .text(featureNameMap[data[0]?.featureName] || data[0]?.featureName || 'Value');

    const toolbar = g.append('g')
      .attr('class', 'zoom-toolbar')
      .attr('transform', `translate(${width - 160}, 10)`);

    const iconPaths = {
      zoomIn: "M14 2v24M2 14h24",
      zoomOut: "M2 14h24",
      reset: "M4 14a10 10 0 1 1 2 6l-2-6h6",
      download: "M12 2v14m0 0l-4-4m4 4l4-4M4 22h16"
    };

    const buttonData = [
      {
        key: "zoomIn", title: "Zoom In", onClick: () => {
          const [start, end] = x.domain();
          const range = end - start;
          const mid = new Date(start.getTime() + range / 2);
          x.domain([new Date(mid.getTime() - range / 4), new Date(mid.getTime() + range / 4)]);
          drawChart();
        }
      },
      {
        key: "zoomOut", title: "Zoom Out", onClick: () => {
          const [start, end] = x.domain();
          const range = end - start;
          const mid = new Date(start.getTime() + range / 2);
          x.domain([new Date(mid.getTime() - range), new Date(mid.getTime() + range)]);
          drawChart();
        }
      },
      {
        key: "reset", title: "Reset Zoom", onClick: () => {
          x.domain(d3.extent(data.map(d => parseTime(d.timeStamp))));
          drawChart();
        }
      },
      {
        key: "download", title: "Download SVG", onClick: () => {
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
        .attr('rx', 0)
        .attr('ry', 0)
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

  }, [data, containerWidth]);

  return (
    <div ref={containerRef} style={{ width: '100%', position: 'relative', overflowX: 'auto' }} />
  );
};

export default LineChart;
