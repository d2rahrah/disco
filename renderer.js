// renderer.js
import {
    placeBlock,
    getWorld,
    getPlacements,
    setOnWorldUpdated,
    setOnPlacementsChanged
} from "./engine.js";

const PLAYER_ID = "rah"; // later dynamic

// ===== CANVAS SETUP =====
const canvas = document.getElementById("worldCanvas");
const ctx = canvas.getContext("2d");

const GRID_SIZE = 80;
const CELL_SIZE = canvas.width / GRID_SIZE;

// ===== RENDER FUNCTION =====
function render() {
    const world = getWorld();
    const placements = getPlacements();

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // background
    ctx.fillStyle = "#05060a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    // grid lines
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        const p = i * CELL_SIZE;
        ctx.beginPath();
        ctx.moveTo(p, 0);
        ctx.lineTo(p, canvas.height);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, p);
        ctx.lineTo(canvas.width, p);
        ctx.stroke();
    }

    // Draw world cells
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            if (world[y][x] !== 0) {
                ctx.fillStyle = "#4af2a1"; // living cell color
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }

    // Draw placement preview
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    placements.forEach(p => {
        ctx.fillRect(p.x * CELL_SIZE, p.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    });
}

// ===== CLICK HANDLER =====
canvas.addEventListener("click", e => {
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);

    placeBlock(x, y, PLAYER_ID);
    render();
});

// ===== ENGINE CALLBACKS =====
setOnWorldUpdated(render);
setOnPlacementsChanged(render);

// Initial draw
render();
