import React, { useEffect, useRef, useState } from "react";

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
}

function drawDistanceBadge(ctx, a, b, km, isPath) {
  const mx = (a.px + b.px) / 2;
  const my = (a.py + b.py) / 2;
  const text = String(km);

  ctx.font = isPath
    ? "700 11px Inter, system-ui, sans-serif"
    : "600 10.5px Inter, system-ui, sans-serif";
  const textW = ctx.measureText(text).width;
  const boxW = textW + 10;
  const boxH = 17;

  ctx.beginPath();
  drawRoundedRect(ctx, mx - boxW / 2, my - boxH / 2, boxW, boxH, 4);
  ctx.fillStyle = isPath ? "#0f6b54" : "#ffffff";
  ctx.fill();
  ctx.lineWidth = 1;
  ctx.strokeStyle = isPath ? "#0a4f3d" : "#cbd5e1";
  ctx.stroke();

  ctx.fillStyle = isPath ? "#ffffff" : "#475569";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, mx, my + 0.5);
}

function drawArrowHead(ctx, a, b, stopOffset) {
  const dx = b.px - a.px;
  const dy = b.py - a.py;
  const len = Math.hypot(dx, dy);
  if (len < stopOffset + 12) return;

  const ux = dx / len;
  const uy = dy / len;
  const tipX = b.px - ux * stopOffset;
  const tipY = b.py - uy * stopOffset;
  const arrowLen = 9;
  const arrowWidth = 5;

  ctx.beginPath();
  ctx.moveTo(tipX, tipY);
  ctx.lineTo(tipX - ux * arrowLen - uy * arrowWidth, tipY - uy * arrowLen + ux * arrowWidth);
  ctx.lineTo(tipX - ux * arrowLen + uy * arrowWidth, tipY - uy * arrowLen - ux * arrowWidth);
  ctx.closePath();
  ctx.fillStyle = "#0f6b54";
  ctx.fill();
}

export default function MapCanvas({ mapData, startCity, goalCity, result, heuristics }) {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const projectedRef = useRef([]);
  const [tooltip, setTooltip] = useState(null);
  const [hoveredName, setHoveredName] = useState(null);
  const [sizeTick, setSizeTick] = useState(0);

  useEffect(() => {
    const handleResize = () => setSizeTick((n) => n + 1);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper || !mapData) return;

    const rect = wrapper.getBoundingClientRect();
    const width = Math.max(300, Math.floor(rect.width));
    const height = Math.max(380, Math.floor(rect.height));
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext("2d");
    ctx.save();
    ctx.scale(dpr, dpr);

    // Subtle cartographic grid
    ctx.fillStyle = "#f8faf9";
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "#e8efec";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let gx = 32; gx < width; gx += 32) {
      ctx.moveTo(gx, 0);
      ctx.lineTo(gx, height);
    }
    for (let gy = 32; gy < height; gy += 32) {
      ctx.moveTo(0, gy);
      ctx.lineTo(width, gy);
    }
    ctx.stroke();

    // Auto-fit coordinate projection
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const c of mapData.cities) {
      if (c.x < minX) minX = c.x;
      if (c.x > maxX) maxX = c.x;
      if (c.y < minY) minY = c.y;
      if (c.y > maxY) maxY = c.y;
    }
    const spanX = maxX - minX || 1;
    const spanY = maxY - minY || 1;
    const padX = Math.max(76, width * 0.14);
    const padY = Math.max(48, height * 0.11);
    const scale = Math.min(Math.max(40, width - padX * 2) / spanX, Math.max(40, height - padY * 2) / spanY);
    const offsetX = (width - spanX * scale) / 2;
    const offsetY = (height - spanY * scale) / 2;

    const coords = new Map();
    const projected = [];
    for (const c of mapData.cities) {
      const px = offsetX + (c.x - minX) * scale;
      const py = height - (offsetY + (c.y - minY) * scale);
      const pt = { ...c, px, py };
      coords.set(c.name, pt);
      projected.push(pt);
    }
    projectedRef.current = projected;

    const pathNodes = new Set();
    const pathEdgeSet = new Set();
    const pathDirectedEdges = [];
    if (result && result.found && result.path.length > 0) {
      for (const c of result.path) pathNodes.add(c);
      for (let i = 0; i < result.path.length - 1; i++) {
        const u = result.path[i];
        const v = result.path[i + 1];
        pathEdgeSet.add(`${u}||${v}`);
        pathEdgeSet.add(`${v}||${u}`);
        pathDirectedEdges.push({ from: u, to: v });
      }
    }

    const exploredSet = new Set(result && Array.isArray(result.exploredOrder) ? result.exploredOrder : []);

    // Draw non-path roads
    for (const road of mapData.roads) {
      const a = coords.get(road.from);
      const b = coords.get(road.to);
      if (!a || !b || pathEdgeSet.has(`${road.from}||${road.to}`)) continue;
      ctx.beginPath();
      ctx.moveTo(a.px, a.py);
      ctx.lineTo(b.px, b.py);
      ctx.strokeStyle = "#cbd5d1";
      ctx.lineWidth = 2;
      ctx.stroke();
      drawDistanceBadge(ctx, a, b, road.km, false);
    }

    // Draw highlighted route roads
    for (const edge of pathDirectedEdges) {
      const a = coords.get(edge.from);
      const b = coords.get(edge.to);
      if (!a || !b) continue;
      const roadObj = mapData.roads.find(
        (r) => (r.from === edge.from && r.to === edge.to) || (r.from === edge.to && r.to === edge.from)
      );

      ctx.beginPath();
      ctx.moveTo(a.px, a.py);
      ctx.lineTo(b.px, b.py);
      ctx.strokeStyle = "rgba(15, 107, 84, 0.22)";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(a.px, a.py);
      ctx.lineTo(b.px, b.py);
      ctx.strokeStyle = "#0f6b54";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.stroke();

      drawArrowHead(ctx, a, b, 15);
      if (roadObj) drawDistanceBadge(ctx, a, b, roadObj.km, true);
    }

    // Draw city nodes & labels
    const centerX = width / 2;
    for (const city of projected) {
      const isStart = city.name === startCity;
      const isGoal = city.name === goalCity;
      const isOnPath = pathNodes.has(city.name);
      const isExplored = exploredSet.has(city.name);
      const isHovered = hoveredName === city.name;

      let radius = 6.5;
      let fill = "#ffffff";
      let stroke = "#475569";
      let lineWidth = 2.2;

      if (isExplored && !isOnPath && !isStart && !isGoal) {
        fill = "#fef3c7";
        stroke = "#d97706";
        radius = 7;
      }
      if (isOnPath) {
        fill = "#0f6b54";
        stroke = "#ffffff";
        radius = 8;
        lineWidth = 2.5;
      }
      if (isStart) {
        fill = "#059669";
        stroke = "#ffffff";
        radius = 9.5;
        lineWidth = 3;
      }
      if (isGoal) {
        fill = "#dc2626";
        stroke = "#ffffff";
        radius = 9.5;
        lineWidth = 3;
      }

      if (isStart || isGoal || isHovered) {
        ctx.beginPath();
        ctx.arc(city.px, city.py, radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = isGoal
          ? "rgba(220, 38, 38, 0.16)"
          : isStart
          ? "rgba(5, 150, 105, 0.18)"
          : "rgba(15, 107, 84, 0.15)";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(city.px, city.py, radius, 0, Math.PI * 2);
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = stroke;
      ctx.stroke();

      ctx.font =
        isStart || isGoal || isOnPath
          ? "700 12.5px Inter, system-ui, sans-serif"
          : "600 12px Inter, system-ui, sans-serif";
      const placeLeft = city.px < centerX - 18;
      ctx.textAlign = placeLeft ? "right" : "left";
      ctx.textBaseline = "middle";
      const labelX = placeLeft ? city.px - (radius + 8) : city.px + (radius + 8);
      const labelY = city.py - 2;

      ctx.lineWidth = 3.5;
      ctx.strokeStyle = "rgba(248, 250, 249, 0.94)";
      ctx.strokeText(city.name, labelX, labelY);

      ctx.fillStyle = isGoal ? "#b91c1c" : isStart ? "#047857" : isOnPath ? "#0f4c3a" : "#1e293b";
      ctx.fillText(city.name, labelX, labelY);
    }

    ctx.restore();
  }, [mapData, startCity, goalCity, result, hoveredName, sizeTick]);

  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    const found = projectedRef.current.find((c) => Math.hypot(mx - c.px, my - c.py) <= 16);
    if (found) {
      const hObj = heuristics.find((item) => item.city === found.name);
      setHoveredName(found.name);
      setTooltip({
        city: found,
        h: hObj ? hObj.h : "—",
        left: mx > rect.width - 190 ? mx - 185 : mx + 14,
        top: Math.max(8, my - 12),
      });
    } else if (hoveredName !== null) {
      setHoveredName(null);
      setTooltip(null);
    }
  };

  return (
    <div className="card">
      <div className="card-title">
        <span>Road Network Map</span>
        <span className="muted-note" style={{ marginTop: 0 }}>
          Hover any city for coordinates &amp; h(n)
        </span>
      </div>

      <div ref={wrapperRef} className="map-wrapper">
        <canvas
          ref={canvasRef}
          style={{ cursor: hoveredName ? "pointer" : "default" }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            setHoveredName(null);
            setTooltip(null);
          }}
        />
        {tooltip && (
          <div className="map-tooltip" style={{ left: tooltip.left, top: tooltip.top }}>
            <div className="tt-name">{tooltip.city.name}</div>
            <div className="tt-meta">
              Coordinates: ({tooltip.city.x}, {tooltip.city.y})
            </div>
            <div className="tt-meta">
              h({tooltip.city.name}) to {goalCity}:{" "}
              <strong>
                {tooltip.h} {mapData.unit || "km"}
              </strong>
            </div>
          </div>
        )}
      </div>

      <div className="legend">
        <span className="legend-item">
          <span className="legend-dot start" />
          Start City
        </span>
        <span className="legend-item">
          <span className="legend-dot goal" />
          Goal City
        </span>
        <span className="legend-item">
          <span className="legend-dot path" />
          Path City &amp; Route
        </span>
        <span className="legend-item">
          <span className="legend-dot explored" />
          Expanded (Not on Path)
        </span>
      </div>
    </div>
  );
}
