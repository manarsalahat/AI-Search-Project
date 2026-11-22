import { buildGraph, computeHeuristic, reconstructPath } from "./graphUtils.js";

// Depth-First Search (LIFO stack, alphabetical tie-breaking, goal test on pop)
export function dfs(mapData, start, goal) {
  const { citiesByName, adjacency } = buildGraph(mapData);

  if (!adjacency.has(start) || !adjacency.has(goal)) {
    return {
      algorithm: "DFS",
      label: "Depth-First Search (DFS)",
      implemented: true,
      found: false,
      path: [],
      cost: null,
      steps: 0,
      exploredOrder: [],
      trace: [],
    };
  }

  const stack = [{ city: start, parent: null, g: 0 }];
  const explored = new Set();
  const trace = [];
  let steps = 0;

  while (stack.length > 0) {
    const node = stack.pop();
    if (explored.has(node.city)) continue;
    explored.add(node.city);

    const h = computeHeuristic(citiesByName, node.city, goal);
    if (node.city === goal) {
      trace.push({
        step: steps,
        city: node.city,
        g: node.g,
        h,
        f: node.g + h,
        action: "Goal reached",
      });
      return {
        algorithm: "DFS",
        label: "Depth-First Search (DFS)",
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
      h,
      f: node.g + h,
      action: "Expanded",
    });

    const neighbors = adjacency.get(node.city) || [];
    // Push in reverse alphabetical order so the first alphabetically is popped first
    for (let i = neighbors.length - 1; i >= 0; i--) {
      const edge = neighbors[i];
      if (!explored.has(edge.to)) {
        stack.push({ city: edge.to, parent: node, g: node.g + edge.km });
      }
    }
  }

  return {
    algorithm: "DFS",
    label: "Depth-First Search (DFS)",
    implemented: true,
    found: false,
    path: [],
    cost: null,
    steps,
    exploredOrder: Array.from(explored),
    trace,
  };
}
