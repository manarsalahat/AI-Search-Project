import React from "react";

export default function ResultCard({ result, unit, startCity, goalCity }) {
  if (!result) return null;

  const isNotImplemented = result.implemented === false;

  const badgeClass = isNotImplemented
    ? "badge badge-suboptimal"
    : !result.found
    ? "badge badge-notfound"
    : result.isOptimal === false
    ? "badge badge-suboptimal"
    : "badge badge-optimal";

  const badgeText = isNotImplemented
    ? "Not Implemented"
    : !result.found
    ? "No path"
    : result.isOptimal === true
    ? "Optimal"
    : result.isOptimal === false
    ? "Suboptimal"
    : "Route Found";

  return (
    <section className="card">
      <div className="card-title">
        <span>{result.label}</span>
        <span className={badgeClass}>{badgeText}</span>
      </div>

      <div className="metrics-grid">
        <div className="metric-box">
          <div className="metric-label">Total Cost</div>
          <div className="metric-value">
            {!isNotImplemented && result.found ? `${result.cost} ${unit}` : "—"}
          </div>
        </div>
        <div className="metric-box">
          <div className="metric-label">Steps (Expanded)</div>
          <div className="metric-value">
            {!isNotImplemented && result.steps !== null ? result.steps : "—"}
          </div>
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label>Path Found</label>
        <div className="path-chips">
          {isNotImplemented ? (
            <span className="muted-note">This algorithm is not implemented yet.</span>
          ) : !result.found ? (
            <span className="muted-note">
              No route connects {startCity} to {goalCity}.
            </span>
          ) : (
            result.path.map((city, idx) => {
              const chipClass = [
                "path-chip",
                idx === 0 ? "is-start" : "",
                idx === result.path.length - 1 ? "is-goal" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <React.Fragment key={`${city}-${idx}`}>
                  <span className={chipClass}>{city}</span>
                  {idx < result.path.length - 1 && <span className="path-arrow">→</span>}
                </React.Fragment>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
