// hud.js
import {
  getPlayerStats,
  getTickCount,
  setOnWorldUpdated,
  setOnPlacementsChanged
} from "./engine.js";

const PLAYER_ID = "rah"; // later dynamic

function updateHUD() {
  const stats = getPlayerStats()[PLAYER_ID];
  if (!stats) return;

  document.querySelector(".hud-value").textContent = stats.mass;
  document.querySelector(".hud-status").textContent = "Tick: " + getTickCount();
  document.querySelector(".hud-sub").textContent =
    `${stats.blocksToday} / 10 remaining`;
}

setOnWorldUpdated(() => {
  updateHUD();
});

setOnPlacementsChanged(() => {
  updateHUD();
});

// initial draw
updateHUD();
