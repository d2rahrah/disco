// hud.js
import {
  getPlayerStats,
  getTickCount,
  setOnWorldUpdated,
  setOnPlacementsChanged
} from "./engine.js";

const PLAYER_ID = "rah"; // later dynamic

// ===== DOM ELEMENTS =====
const hudStatus      = document.querySelector(".hud-status");
const hudPlayerName  = document.querySelector(".hud-card .hud-value");
const hudBlocksLeft  = document.querySelectorAll(".hud-sub")[1]; // "6 / 10 remaining"
const hudScoreValue  = document.querySelectorAll(".hud-card .hud-value")[1];
const hudScoreSub    = document.querySelectorAll(".hud-sub")[2];
const hudTimer       = document.querySelector(".hud-timer");

// ===== UPDATE HUD =====
function updateHUD() {
  const stats = getPlayerStats()[PLAYER_ID];
  if (!stats) return;

  // Tick counter
  hudStatus.textContent = "Tick: " + getTickCount();

  // Player name
  hudPlayerName.textContent = PLAYER_ID;

  // Blocks remaining
  hudBlocksLeft.textContent = `${stats.blocksToday} / 10 remaining`;

  // Score (for now: mass = score)
  hudScoreValue.textContent = stats.mass;

  // Subscore (territory = mass, kills = motion)
  hudScoreSub.textContent = `Territory: ${stats.mass} · Kills: ${stats.motion}`;

  // Timer placeholder (until real tick timer is added)
  hudTimer.textContent = "00:00:00";
}

// ===== HOOKS =====
setOnWorldUpdated(updateHUD);
setOnPlacementsChanged(updateHUD);

// Initial draw
updateHUD();
