import React from "react";
import { ArrowLeftRight, Play, Layers } from "lucide-react";

const ALGORITHMS = [
  { value: "BFS", label: "Breadth-First Search (BFS)" },
  { value: "DFS", label: "Depth-First Search (DFS)" },
  { value: "UCS", label: "Uniform Cost Search (UCS)" },
  { value: "Greedy", label: "Greedy Best-First Search" },
  { value: "A*", label: "A* Search" },
];

export default function ControlsPanel({
  cities,
  startCity,
  goalCity,
  algorithm,
  status,
  onStartChange,
  onGoalChange,
  onSwap,
  onAlgorithmChange,
  onFindRoute,
  onCompareAll,
}) {
  return (
    <section className="card">
      <h2 className="card-title">Search Controls</h2>

      {status && status.message && (
        <div className={`status-banner ${status.type}`}>{status.message}</div>
      )}

      <div className="city-row">
        <div className="form-group">
          <label htmlFor="startCity">Start City</label>
          <select
            id="startCity"
            value={startCity}
            onChange={(e) => onStartChange(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          className="btn btn-icon"
          title="Swap start and goal"
          aria-label="Swap start and goal"
          onClick={onSwap}
        >
          <ArrowLeftRight size={16} />
        </button>

        <div className="form-group">
          <label htmlFor="goalCity">Goal City</label>
          <select
            id="goalCity"
            value={goalCity}
            onChange={(e) => onGoalChange(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="algorithmSelect">Search Algorithm</label>
        <select
          id="algorithmSelect"
          value={algorithm}
          onChange={(e) => onAlgorithmChange(e.target.value)}
        >
          {ALGORITHMS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
      </div>

      <div className="btn-row">
        <button type="button" className="btn btn-primary" onClick={onFindRoute}>
          <Play size={15} />
          Find Route
        </button>
        <button type="button" className="btn btn-secondary" onClick={onCompareAll}>
          <Layers size={15} />
          Compare All
        </button>
      </div>
    </section>
  );
}
