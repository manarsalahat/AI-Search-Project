import React, { useMemo, useState } from "react";
import { DEFAULT_WESTBANK_MAP } from "./data/westbankMap.js";
import {
  runAlgorithm,
  ucs,
  compareAll,
  computeAllHeuristics,
  validateMapJson,
} from "./algorithms/index.js";
import Header from "./components/Header.jsx";
import ControlsPanel from "./components/ControlsPanel.jsx";
import ResultCard from "./components/ResultCard.jsx";
import InspectorPanel from "./components/InspectorPanel.jsx";
import MapCanvas from "./components/MapCanvas.jsx";
import ComparisonTable from "./components/ComparisonTable.jsx";

export default function App() {
  const [mapData, setMapData] = useState(DEFAULT_WESTBANK_MAP);
  const [startCity, setStartCity] = useState("Jenin");
  const [goalCity, setGoalCity] = useState("Hebron");
  const [algorithm, setAlgorithm] = useState("Greedy");
  const [showCompare, setShowCompare] = useState(false);
  const [status, setStatus] = useState(null);

  const heuristics = useMemo(
    () => computeAllHeuristics(mapData, goalCity),
    [mapData, goalCity]
  );

  const comparison = useMemo(() => {
    if (!showCompare) return null;
    return compareAll(mapData, startCity, goalCity);
  }, [showCompare, mapData, startCity, goalCity]);

  const currentResult = useMemo(() => {
    if (comparison) {
      return comparison.results.find((r) => r.algorithm === algorithm) || comparison.results[0];
    }
    const res = runAlgorithm(mapData, algorithm, startCity, goalCity);
    if (res.implemented === false) {
      return { ...res, isOptimal: false };
    }
    const ucsRef = ucs(mapData, startCity, goalCity);
    const hasOptimalRef = ucsRef.implemented !== false && ucsRef.found;
    return {
      ...res,
      isOptimal: hasOptimalRef ? res.found && res.cost === ucsRef.cost : null,
    };
  }, [comparison, mapData, algorithm, startCity, goalCity]);

  const handleUploadFile = (file) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(String(ev.target.result));
        const validation = validateMapJson(parsed);
        if (!validation.valid) {
          setStatus({ type: "error", message: `Invalid map JSON: ${validation.error}` });
          return;
        }
        const newMap = validation.map;
        setMapData(newMap);
        setStartCity(newMap.cities[0].name);
        setGoalCity(newMap.cities[newMap.cities.length - 1].name);
        setShowCompare(false);
        setStatus({
          type: "success",
          message: `Loaded custom map "${newMap.name}" successfully.`,
        });
      } catch (err) {
        setStatus({ type: "error", message: `Could not parse JSON file: ${err.message}` });
      }
    };
    reader.onerror = () => {
      setStatus({ type: "error", message: "Failed to read the selected file." });
    };
    reader.readAsText(file);
  };

  const handleResetDefault = () => {
    setMapData(DEFAULT_WESTBANK_MAP);
    setStartCity("Jenin");
    setGoalCity("Hebron");
    setShowCompare(false);
    setStatus({ type: "success", message: "Restored default West Bank road map." });
  };

  const handleDownloadJson = () => {
    const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "westbank_map.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSwap = () => {
    setStartCity(goalCity);
    setGoalCity(startCity);
  };

  const unit = mapData.unit || "km";

  return (
    <div>
      <Header
        mapData={mapData}
        onUploadFile={handleUploadFile}
        onResetDefault={handleResetDefault}
        onDownloadJson={handleDownloadJson}
      />

      <main className="app-main">
        <aside className="sidebar">
          <ControlsPanel
            cities={mapData.cities}
            startCity={startCity}
            goalCity={goalCity}
            algorithm={algorithm}
            status={status}
            onStartChange={(val) => {
              setStatus(null);
              setStartCity(val);
            }}
            onGoalChange={(val) => {
              setStatus(null);
              setGoalCity(val);
            }}
            onSwap={handleSwap}
            onAlgorithmChange={(val) => {
              setStatus(null);
              setAlgorithm(val);
            }}
            onFindRoute={() => setStatus(null)}
            onCompareAll={() => {
              setStatus(null);
              setShowCompare(true);
            }}
          />

          <ResultCard
            result={currentResult}
            unit={unit}
            startCity={startCity}
            goalCity={goalCity}
          />

          <InspectorPanel
            result={currentResult}
            heuristics={heuristics}
            goalCity={goalCity}
          />
        </aside>

        <section className="content-col">
          <MapCanvas
            mapData={mapData}
            startCity={startCity}
            goalCity={goalCity}
            result={currentResult}
            heuristics={heuristics}
          />

          <ComparisonTable
            comparison={comparison}
            selectedAlgorithm={algorithm}
            unit={unit}
            startCity={startCity}
            goalCity={goalCity}
            onSelectAlgorithm={(alg) => setAlgorithm(alg)}
          />
        </section>
      </main>
    </div>
  );
}
