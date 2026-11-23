import { buildGraph } from "./graphUtils.js";

export function bfs(mapData, start, goal) {
  const graph = buildGraph(mapData);
const adjacency = graph.adjacency;

  const queue = [start];
  const visited = new Set([start]);
  const parent = new Map();
  const pathCosts = new Map([[start, 0]]);

  const exploredOrder = [];
  const trace = [];

  let steps = 0;

  while (queue.length) {
    const current = queue.shift();

    steps++;
    exploredOrder.push(current);

    const currentCost = pathCosts.get(current);

    if (current === goal) {
      trace.push({
        step: steps,
        city: current,
        g: currentCost,
        h: 0,
        f: currentCost,
        action: "Goal reached",
      });

      const path = [];
      let city = goal;

      while (city !== undefined) {
        path.unshift(city);
        city = parent.get(city);
      }

      return {
        algorithm: "BFS",
        label: "Breadth-First Search (BFS)",
        implemented: true,
        found: true,
        path,
        cost: currentCost,
        steps,
        exploredOrder,
        trace,
      };
    }

    trace.push({
      step: steps,
      city: current,
      g: currentCost,
      h: 0,
      f: currentCost,
      action: "Expand",
    });

    for (const { to, km } of adjacency.get(current) || []) {
      if (!visited.has(to)) {
        visited.add(to);
        parent.set(to, current);

        pathCosts.set(to, currentCost + km);

        queue.push(to);
      }
    }
  }

  return {
    algorithm: "BFS",
    label: "Breadth-First Search (BFS)",
    implemented: true,
    found: false,
    path: [],
    cost: null,
    steps,
    exploredOrder,
    trace,
  };
}