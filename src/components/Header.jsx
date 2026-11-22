import React, { useRef } from "react";
import { Upload, RotateCcw, Download } from "lucide-react";

export default function Header({ mapData, onUploadFile, onResetDefault, onDownloadJson }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      onUploadFile(file);
    }
    e.target.value = "";
  };

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand">
          <h1>AI Search Project</h1>
          <p>BFS, DFS, UCS, Greedy &amp; A*</p>
        </div>

        <div className="header-actions">
          <span className="map-pill">
            {mapData.name} · {mapData.cities.length} cities · {mapData.roads.length} roads
          </span>

          <button
            type="button"
            className="btn btn-header"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
          >
            <Upload size={15} />
            Upload Map JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden-input"
            onChange={handleFileChange}
          />

          <button type="button" className="btn btn-header" onClick={onResetDefault}>
            <RotateCcw size={15} />
            Reset Default
          </button>

          <button type="button" className="btn btn-header" onClick={onDownloadJson}>
            <Download size={15} />
            Download JSON
          </button>
        </div>
      </div>
    </header>
  );
}
