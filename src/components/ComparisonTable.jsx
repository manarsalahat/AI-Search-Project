import React from "react";

export default function ComparisonTable({
  comparison,
  selectedAlgorithm,
  unit,
  startCity,
  goalCity,
  onSelectAlgorithm,
}) {
  if (!comparison) return null;

  return (
    <div className="card">
      <div className="card-title">
        <span>Algorithm Comparison</span>
        <span className="muted-note" style={{ marginTop: 0 }}>
          {startCity} → {goalCity}
        </span>
      </div>

      <div className="table-wrap">
        <table className="compare-table">
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Path</th>
              <th className="num">Total Cost</th>
              <th className="num">Steps</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {comparison.results.map((r) => {
              const isNotImplemented = r.implemented === false;
              const rowClass = [
                !isNotImplemented && r.isOptimal ? "row-optimal" : "",
                selectedAlgorithm === r.algorithm ? "row-selected" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <tr
                  key={r.algorithm}
                  className={rowClass}
                  onClick={() => onSelectAlgorithm(r.algorithm)}
                >
                  <td>
                    <strong>{r.algorithm}</strong>
                  </td>
                  <td>
                    {isNotImplemented
                      ? "Not implemented yet"
                      : r.found
                      ? r.path.join(" → ")
                      : "No path found"}
                  </td>
                  <td className="num">
                    {!isNotImplemented && r.found ? `${r.cost} ${unit}` : "—"}
                  </td>
                  <td className="num">
                    {!isNotImplemented && r.steps !== null ? r.steps : "—"}
                  </td>
                  <td>
                    {isNotImplemented ? (
                      <span className="badge badge-suboptimal">Not Implemented</span>
                    ) : !r.found ? (
                      <span className="badge badge-notfound">No path</span>
                    ) : r.isOptimal ? (
                      <span className="badge badge-optimal">★ Optimal</span>
                    ) : (
                      <span className="badge badge-suboptimal">Non-optimal</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="muted-note">
        Click any row above to highlight that algorithm&apos;s path and expansion trace on the map.
      </p>
    </div>
  );
}
