import { bfs } from "./bfs.js";
import { dfs } from "./dfs.js";
import { ucs } from "./ucs.js";
import { greedy } from "./greedy.js";
import { astar } from "./astar.js";
import {
  buildGraph,
  computeHeuristic,
  computeAllHeuristics,
  validateMapJson,
} from "./graphUtils.js";

export function runAlgorithm(mapData, algorithmKey, start, goal) {
  switch (algorithmKey) {
    case "BFS":
      return bfs(mapData, start, goal);
    case "DFS":
      return dfs(mapData, start, goal);
    case "UCS":
      return ucs(mapData, start, goal);
    case "Greedy":
      return greedy(mapData, start, goal);
    case "A*":
      return astar(mapData, start, goal);
    default:
      throw new Error("Unknown algorithm: " + algorithmKey);
  }
}

export function compareAll(mapData, start, goal) {
  const keys = ["BFS", "DFS", "UCS", "Greedy", "A*"];
  const results = keys.map((key) => runAlgorithm(mapData, key, start, goal));

  const validCosts = results
    .filter((r) => r.implemented !== false && r.found && typeof r.cost === "number")
    .map((r) => r.cost);
  const minCost = validCosts.length > 0 ? Math.min(...validCosts) : null;

  for (const r of results) {
    if (r.implemented === false) {
      r.isOptimal = false;
    } else {
      r.isOptimal = r.found && minCost !== null && r.cost === minCost;
    }
  }

  return { results, minCost };
}

export {
  bfs,
  dfs,
  ucs,
  greedy,
  astar,
  buildGraph,
  computeHeuristic,
  computeAllHeuristics,
  validateMapJson,
};
