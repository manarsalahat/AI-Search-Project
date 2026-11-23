# AI Search Project

A React + Vite web application for finding and comparing routes between cities on a road map using classical AI search algorithms.
## Team Members

- Manar Salahat — 12428251
- Manwa Haidariyah — 12428257
- Yaqeen Ashour — 
## Running the Project

Requires Node.js (v18 or newer).

```bash
npm install
npm run dev
```

Open the local URL shown in the terminal (usually `http://localhost:5173`).

To build for production:

```bash
npm run build
```

## Implemented vs. Pending Algorithms

- **Implemented:** `dfs.js` (Depth-First Search), `greedy.js` (Greedy Best-First Search)
- **Pending (Skeletons):** `bfs.js`, `ucs.js`, `astar.js`

## Search Rules

- `h(n)` is the straight-line distance from city `n` to the goal, rounded down (`Math.floor`).
- Ties are broken alphabetically by city name.
- Goal test is applied when a node is popped from the frontier.
- Graph search is used so no city is expanded twice.
- Steps count the number of nodes removed from the frontier and expanded.

## Map JSON Format

The app loads `westbank_map.json` by default and accepts any custom JSON file with this structure:

```json
{
  "name": "Map Name",
  "unit": "km",
  "cities": [{ "name": "CityA", "x": 10, "y": 20 }],
  "roads": [{ "from": "CityA", "to": "CityB", "km": 15 }]
}
```

## Project Structure

```text
AI_Search_Project/
├── public/westbank_map.json
├── src/
│   ├── algorithms/
│   │   ├── bfs.js
│   │   ├── dfs.js
│   │   ├── ucs.js
│   │   ├── greedy.js
│   │   ├── astar.js
│   │   ├── graphUtils.js
│   │   ├── priorityQueue.js
│   │   └── index.js
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── ControlsPanel.jsx
│   │   ├── ResultCard.jsx
│   │   ├── InspectorPanel.jsx
│   │   ├── MapCanvas.jsx
│   │   └── ComparisonTable.jsx
│   ├── data/westbankMap.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── index.html
├── package.json
└── vite.config.js
```
