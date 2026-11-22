import React, { useState } from "react";

export default function InspectorPanel({ result, heuristics, goalCity }) {
  const [activeTab, setActiveTab] = useState("trace");
  const isNotImplemented = result && result.implemented === false;

  return (
    <section className="card">
      <div className="tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === "trace" ? "active" : ""}`}
          onClick={() => setActiveTab("trace")}
        >
          Expansion Trace
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "heuristics" ? "active" : ""}`}
          onClick={() => setActiveTab("heuristics")}
        >
          Heuristics h(n)
        </button>
      </div>

      {activeTab === "trace" ? (
        <div className="inspector-scroll">
          {isNotImplemented ? (
            <p className="muted-note" style={{ marginTop: 0 }}>
              This algorithm is not implemented yet.
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Step</th>
                  <th>City</th>
                  <th className="num">g(n)</th>
                  <th className="num">h(n)</th>
                  <th className="num">f(n)</th>
                </tr>
              </thead>
              <tbody>
                {result &&
                  result.trace.map((row, i) => (
                    <tr key={`${row.city}-${i}`}>
                      <td>
                        <strong>{row.action === "Goal reached" ? "Goal" : row.step}</strong>
                      </td>
                      <td>{row.city}</td>
                      <td className="num">{row.g}</td>
                      <td className="num">{row.h}</td>
                      <td className="num">{row.f}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        <div className="inspector-scroll">
          <p className="muted-note" style={{ marginTop: 0, marginBottom: 8 }}>
            Straight-line distance to <strong>{goalCity}</strong>, rounded down.
          </p>
          <table>
            <thead>
              <tr>
                <th>City</th>
                <th className="num">h(n)</th>
              </tr>
            </thead>
            <tbody>
              {heuristics.map((item) => (
                <tr key={item.city}>
                  <td>{item.city}</td>
                  <td className="num">{item.h}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
