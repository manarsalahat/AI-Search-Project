import { buildGraph, compareAlpha } from "./graphUtils.js";

export function ucs(mapData, start, goal) {

  const graph = buildGraph(mapData);
const adjacency = graph.adjacency;

  const queue = [{ city: start, cost: 0 }];
  const bestCost = new Map([[start, 0]]);
  const parent = new Map();

  const visited = new Set();
  const exploredOrder = [];
  const trace = [];

  let steps = 0;

  while (queue.length) {
    queue.sort(
      (a, b) =>
        a.cost - b.cost || compareAlpha(a.city, b.city)
    );

    const current = queue.shift();

    if (
      current.cost !== bestCost.get(current.city) ||
      visited.has(current.city)
    ) {
      continue;
    }

    visited.add(current.city);

    steps++;
    exploredOrder.push(current.city);

    if (current.city === goal) {
      trace.push({
        step: steps,
        city: current.city,
        g: current.cost,
        h: 0,
        f: current.cost,
        action: "Goal reached",
      });

      const path = [];
      let city = goal;

      while (city !== undefined) {
        path.unshift(city);
        city = parent.get(city);
      }

      return {
        algorithm: "UCS",
        label: "Uniform-Cost Search (UCS)",
        implemented: true,
        found: true,
        path,
        cost: current.cost,
        steps,
        exploredOrder,
        trace,
      };
    }

    trace.push({
      step: steps,
      city: current.city,
      g: current.cost,
      h: 0,
      f: current.cost,
      action: "Expand",
    });

    for (const { to, km } of adjacency.get(current.city) || []) {
      const nextCost = current.cost + km;

      if (
        !visited.has(to) &&
        (bestCost.get(to) === undefined ||
          nextCost < bestCost.get(to))
      ) {
        bestCost.set(to, nextCost);
        parent.set(to, current.city);

        queue.push({
          city: to,
          cost: nextCost,
        });
      }
    }
  }

  return {
    algorithm: "UCS",
    label: "Uniform-Cost Search (UCS)",
    implemented: true,
    found: false,
    path: [],
    cost: null,
    steps,
    exploredOrder,
    trace,
  };
}