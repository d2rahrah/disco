// ====== CONFIG ======
const GRID_SIZE = 80;          // world is GRID_SIZE x GRID_SIZE
const MAX_BLOCKS_PER_DAY = 10; // per player
const TICK_INTERVAL_MS = 0;    // set >0 if you want auto-ticks later

// ====== STATE ======
let tickCount = 0;

// world[y][x] = 0 (dead) or playerId (string) for living cell owner
let world = Array.from({ length: GRID_SIZE }, () =>
  Array(GRID_SIZE).fill(0)
);

// placements: { x, y, playerId }
let placements = [];

// playerStats[playerId] = { blocksToday, mass, longevity, motion, lastPositions }
let playerStats = {};

// ====== UTIL ======
function ensurePlayer(playerId) {
  if (!playerStats[playerId]) {
    playerStats[playerId] = {
      blocksToday: MAX_BLOCKS_PER_DAY,
      mass: 0,
      longevity: 0,
      motion: 0,
      lastPositions: new Set(), // "x,y" strings
    };
  }
}

function inBounds(x, y) {
  return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
}

function countNeighbors(x, y) {
  let count = 0;
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (inBounds(nx, ny) && world[ny][nx] !== 0) {
        count++;
      }
    }
  }
  return count;
}

// ====== PLACEMENT API ======
export function placeBlock(x, y, playerId) {
  ensurePlayer(playerId);

  const p = playerStats[playerId];
  if (p.blocksToday <= 0) return false;
  if (!inBounds(x, y)) return false;

  // avoid duplicate placement in same spot by same player
  if (placements.some(pl => pl.x === x && pl.y === y && pl.playerId === playerId)) {
    return false;
  }

  placements.push({ x, y, playerId });
  p.blocksToday--;

  if (typeof onPlacementsChanged === "function") {
    onPlacementsChanged(placements);
  }

  return true;
}

export function resetDailyBlocks() {
  Object.values(playerStats).forEach(p => {
    p.blocksToday = MAX_BLOCKS_PER_DAY;
  });
}

// ====== TICK LOGIC ======
function applyPlacements() {
  placements.forEach(p => {
    world[p.y][p.x] = p.playerId;
  });
  placements = [];
}

function computeNextWorld() {
  const newWorld = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(0)
  );

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const neighbors = countNeighbors(x, y);
      const cell = world[y][x];

      if (cell !== 0) {
        // alive
        if (neighbors === 2 || neighbors === 3) {
          newWorld[y][x] = cell; // survives
        }
      } else {
        // dead
        if (neighbors === 3) {
          // birth: choose owner by majority of neighbors
          const owner = majorityOwner(x, y);
          newWorld[y][x] = owner || 0;
        }
      }
    }
  }

  return newWorld;
}

function majorityOwner(x, y) {
  const counts = {};
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (!inBounds(nx, ny)) continue;
      const owner = world[ny][nx];
      if (owner !== 0) {
        counts[owner] = (counts[owner] || 0) + 1;
      }
    }
  }
  let bestOwner = null;
  let bestCount = 0;
  for (const [owner, c] of Object.entries(counts)) {
    if (c > bestCount) {
      bestCount = c;
      bestOwner = owner;
    }
  }
  return bestOwner;
}

// ====== STATS UPDATE ======
function updateStats(newWorld) {
  // reset mass and longevity increment
  Object.values(playerStats).forEach(p => {
    p.mass = 0;
  });

  const newPositionsByPlayer = {};

  for (let y = 0; y < GRID_SIZE; y++) {
    for (let x = 0; x < GRID_SIZE; x++) {
      const owner = newWorld[y][x];
      if (owner !== 0) {
        ensurePlayer(owner);
        const p = playerStats[owner];
        p.mass++;
        p.longevity++; // +1 per living cell per tick

        const key = `${x},${y}`;
        if (!newPositionsByPlayer[owner]) {
          newPositionsByPlayer[owner] = new Set();
        }
        newPositionsByPlayer[owner].add(key);
      }
    }
  }

  // motion: count cells that changed position since last tick
  for (const [playerId, p] of Object.entries(playerStats)) {
    const prev = p.lastPositions;
    const curr = newPositionsByPlayer[playerId] || new Set();

    let moved = 0;
    curr.forEach(key => {
      if (!prev.has(key)) moved++;
    });

    p.motion += moved;
    p.lastPositions = curr;
  }
}

// ====== TICK ENTRYPOINT ======
export function runTick() {
  applyPlacements();
  const newWorld = computeNextWorld();
  updateStats(newWorld);
  world = newWorld;
  tickCount++;

  if (typeof onWorldUpdated === "function") {
    onWorldUpdated(world, tickCount, playerStats);
  }
}

// ====== HOOKS (to be wired by UI) ======
export let onWorldUpdated = null;      // (world, tickCount, playerStats) => {}
export let onPlacementsChanged = null; // (placements) => {}

export function setOnWorldUpdated(fn) {
  onWorldUpdated = fn;
}

export function setOnPlacementsChanged(fn) {
  onPlacementsChanged = fn;
}

// ====== ACCESSORS ======
export function getWorld() {
  return world;
}

export function getPlayerStats() {
  return playerStats;
}

export function getTickCount() {
  return tickCount;
}

export function getPlacements() {
  return placements;
}

// ====== OPTIONAL AUTO-TICK ======
let tickTimer = null;

export function startAutoTicks() {
  if (TICK_INTERVAL_MS <= 0) return;
  if (tickTimer) return;
  tickTimer = setInterval(runTick, TICK_INTERVAL_MS);
}

export function stopAutoTicks() {
  if (!tickTimer) return;
  clearInterval(tickTimer);
  tickTimer = null;
}
// TEMP: seed a glider so renderer shows something
world[10][10] = "rah";
world[11][11] = "rah";
world[12][9]  = "rah";
world[12][10] = "rah";
world[12][11] = "rah";
