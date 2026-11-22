// Helper functions for building the road graph, computing h(n), and validating map JSON

export function compareAlpha(a, b) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}

export function buildGraph(mapData) {
  const citiesByName = new Map();
  const adjacency = new Map();

  for (const city of mapData.cities) {
    citiesByName.set(city.name, { name: city.name, x: city.x, y: city.y });
    adjacency.set(city.name, []);
  }

  for (const road of mapData.roads) {
    const weight = Number(road.km);
    if (adjacency.has(road.from) && adjacency.has(road.to)) {
      adjacency.get(road.from).push({ to: road.to, km: weight });
      adjacency.get(road.to).push({ to: road.from, km: weight });
    }
  }

  for (const [, neighbors] of adjacency) {
    neighbors.sort((a, b) => compareAlpha(a.to, b.to));
  }

  return { citiesByName, adjacency };
}

export function computeHeuristic(citiesByName, cityName, goalName) {
  const a = citiesByName.get(cityName);
  const b = citiesByName.get(goalName);
  if (!a || !b) return 0;
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.floor(Math.sqrt(dx * dx + dy * dy));
}

export function computeAllHeuristics(mapData, goalName) {
  const { citiesByName } = buildGraph(mapData);
  const result = mapData.cities.map((city) => ({
    city: city.name,
    h: computeHeuristic(citiesByName, city.name, goalName),
  }));
  result.sort((a, b) => compareAlpha(a.city, b.city));
  return result;
}

export function reconstructPath(node) {
  const path = [];
  let current = node;
  while (current !== null) {
    path.push(current.city);
    current = current.parent;
  }
  path.reverse();
  return path;
}

export function validateMapJson(data) {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "JSON root must be an object." };
  }
  if (!Array.isArray(data.cities) || data.cities.length < 2) {
    return { valid: false, error: 'Map must contain a "cities" array with at least 2 cities.' };
  }
  if (!Array.isArray(data.roads)) {
    return { valid: false, error: 'Map must contain a "roads" array.' };
  }

  const cityNames = new Set();
  const cleanCities = [];
  for (let i = 0; i < data.cities.length; i++) {
    const c = data.cities[i];
    if (!c || typeof c.name !== "string" || !c.name.trim()) {
      return { valid: false, error: `City at index ${i} is missing a valid "name".` };
    }
    const name = c.name.trim();
    if (cityNames.has(name)) {
      return { valid: false, error: `Duplicate city name "${name}".` };
    }
    const x = Number(c.x);
    const y = Number(c.y);
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      return { valid: false, error: `City "${name}" must have numeric "x" and "y" coordinates.` };
    }
    cityNames.add(name);
    cleanCities.push({ name, x, y });
  }

  const cleanRoads = [];
  for (let i = 0; i < data.roads.length; i++) {
    const r = data.roads[i];
    if (!r || typeof r.from !== "string" || typeof r.to !== "string") {
      return { valid: false, error: `Road at index ${i} must have "from" and "to" city names.` };
    }
    const from = r.from.trim();
    const to = r.to.trim();
    if (!cityNames.has(from) || !cityNames.has(to)) {
      return { valid: false, error: `Road at index ${i} references unknown city ("${from}" -> "${to}").` };
    }
    const km = Number(r.km);
    if (!Number.isFinite(km) || km < 0) {
      return { valid: false, error: `Road "${from} - ${to}" must have a non-negative numeric "km" distance.` };
    }
    cleanRoads.push({ from, to, km });
  }

  return {
    valid: true,
    map: {
      name: typeof data.name === "string" && data.name.trim() ? data.name.trim() : "Custom Road Map",
      unit: typeof data.unit === "string" && data.unit.trim() ? data.unit.trim() : "km",
      cities: cleanCities,
      roads: cleanRoads,
    },
  };
}
