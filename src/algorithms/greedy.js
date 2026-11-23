import { buildGraph, compareAlpha, computeHeuristic, reconstructPath } from "./graphUtils.js";
import { PriorityQueue } from "./priorityQueue.js";

// Greedy Best-First Search (priority queue ordered by h(n), alphabetical tie-breaking)
export function greedy(mapData, start, goal) {
  const { citiesByName, adjacency } = buildGraph(mapData);

  if (!adjacency.has(start) || !adjacency.has(goal)) {
    return {
      algorithm: "Greedy",
      label: "Greedy Best-First Search",
      implemented: true,
      found: false,
      path: [],
      cost: null,
      steps: 0,
      exploredOrder: [],
      trace: [],
    };
  }

  const pq = new PriorityQueue((a, b) => (a.h !== b.h ? a.h - b.h : compareAlpha(a.city, b.city)));
  const startH = computeHeuristic(citiesByName, start, goal);
  pq.push({ city: start, parent: null, g: 0, h: startH });
  const explored = new Set();
  const trace = [];
  let steps = 0;

  while (!pq.isEmpty()) {
    const node = pq.pop();
    if (explored.has(node.city)) continue;
    explored.add(node.city);

    if (node.city === goal) {
      trace.push({
        step: steps,
        city: node.city,
        g: node.g,
        h: node.h,
        f: node.g + node.h,
        action: "Goal reached",
      });
      return {
        algorithm: "Greedy",
        label: "Greedy Best-First Search",
        implemented: true,
        found: true,
        path: reconstructPath(node),
        cost: node.g,
        steps,
        exploredOrder: Array.from(explored),
        trace,
      };
    }

    steps++;
    trace.push({
      step: steps,
      city: node.city,
      g: node.g,
      h: node.h,
      f: node.g + node.h,
      action: "Expanded",
    });

    for (const edge of adjacency.get(node.city) || []) {
      if (!explored.has(edge.to)) {
        const nextH = computeHeuristic(citiesByName, edge.to, goal);
        pq.push({ city: edge.to, parent: node, g: node.g + edge.km, h: nextH });
      }
    }
  }

  return {
    algorithm: "Greedy",
    label: "Greedy Best-First Search",
    implemented: true,
    found: false,
    path: [],
    cost: null,
    steps,
    exploredOrder: Array.from(explored),
    trace,
  };
}
