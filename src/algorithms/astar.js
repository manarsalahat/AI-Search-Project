// TODO: Implement A* Search
import {
  buildGraph,
  computeHeuristic,
  reconstructPath,
} from "./graphUtils.js";

export function astar(mapData, start, goal) {
  const { citiesByName, adjacency } = buildGraph(mapData);

  const open = [];
  const bestG = new Map();
  const exploredOrder = [];
  const trace = [];

  const startH = computeHeuristic(citiesByName, start, goal);

  open.push({
    city: start,
    g: 0,
    h: startH,
    f: startH,
    parent: null,
  });

  bestG.set(start, 0);

  while (open.length > 0) {
    open.sort((a, b) =>
        a.f - b.f || a.h - b.h || a.city.localeCompare(b.city)
    );

    const current = open.shift();

    if (current.g > bestG.get(current.city)) {
      continue;
    }

    exploredOrder.push(current.city);

    trace.push({
      step: trace.length + 1,
      city: current.city,
      action: current.city === goal ? "Goal reached" : "Expand",
      g: current.g,
      h: current.h,
      f: current.f,
    });

    if (current.city === goal) {
      return {
        algorithm: "A*",
        label: "A* Search",
        implemented: true,
        found: true,
        path: reconstructPath(current),
        cost: current.g,
        steps: exploredOrder.length,
        exploredOrder,
        trace,
      };
    }

    const neighbors = adjacency.get(current.city) || [];

    for (const neighbor of neighbors) {
      const newG = current.g + neighbor.km;

      if (newG < (bestG.get(neighbor.to) ?? Infinity)) {
        bestG.set(neighbor.to, newG);

        const h = computeHeuristic(
            citiesByName,
            neighbor.to,
            goal
        );

        open.push({
          city: neighbor.to,
          g: newG,
          h,
          f: newG + h,
          parent: current,
        });
      }
    }
  }

  return {
    algorithm: "A*",
    label: "A* Search",
    implemented: true,
    found: false,
    path: [],
    cost: null,
    steps: exploredOrder.length,
    exploredOrder,
    trace,
  };
}