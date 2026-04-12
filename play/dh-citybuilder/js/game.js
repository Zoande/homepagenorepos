// ============================================================
// MegaCity Builder - Main Game Controller
// ============================================================

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');

        this.state = {
            running: false,
            paused: false,
            speedIndex: 1,
            selectedBuilding: null,
            demolishMode: false,
            hoveredTile: null,
        };

        // Core systems
        this.map = null;
        this.economy = null;
        this.simulation = null;
        this.camera = null;
        this.renderer = null;
        this.input = null;
        this.ui = null;
        this.audio = new AudioManager();

        // Timing
        this.lastFrameTime = 0;
        this.lastTickTime = 0;
        this.tickAccumulator = 0;
        this.frameCount = 0;
        this.fps = 0;
        this.fpsTimer = 0;

        this._resizeCanvas();
        window.addEventListener('resize', () => this._resizeCanvas());

        // Initialize UI first (shows welcome screen)
        this.ui = new UI(this);
    }

    _resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.renderer) {
            this.renderer.resize(this.canvas.width, this.canvas.height);
        }
    }

    // Start a new game
    start(seed) {
        this.map = new GameMap(CONFIG.MAP_WIDTH, CONFIG.MAP_HEIGHT, seed);
        this.economy = new Economy();
        this.simulation = new Simulation(this.map, this.economy);
        this.camera = new Camera(this.canvas);
        this.renderer = new Renderer(this.canvas, this.camera, this.map);
        this.input = new InputHandler(this.canvas, this.camera, this);

        // Initialize audio on first user interaction
        this.audio.init();

        // Center camera on map
        this.camera.centerOnMap();

        // Listen to simulation events
        this.simulation.events.on('milestone', (data) => {
            this.ui.addNotification(data.message, 'success');
            this.audio.playMilestone();
        });

        this.simulation.events.on('crisis', (data) => {
            this.ui.addNotification(data.message, 'danger');
        });

        this.simulation.events.on('disaster', (data) => {
            this.ui.addNotification(data.message, 'danger');
            this.audio.playDisaster();
        });

        this.simulation.events.on('notification', (data) => {
            this.ui.addNotification(data.message, data.type);
        });

        this.simulation.events.on('monthEnd', () => {
            // Auto-save every 6 months
            if (this.economy.month % 6 === 0) {
                this.saveGame();
            }
        });

        this.state.running = true;
        this.state.paused = false;
        this.lastFrameTime = performance.now();
        this.lastTickTime = performance.now();

        this.ui.addNotification('🏗️ Welcome, Mayor! Start building your city!', 'info');

        // Start game loop
        this._gameLoop(performance.now());
    }

    // ---- GAME LOOP ----
    _gameLoop(timestamp) {
        if (!this.state.running) return;

        const dt = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;

        // FPS counter
        this.frameCount++;
        this.fpsTimer += dt;
        if (this.fpsTimer >= 1.0) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.fpsTimer = 0;
        }

        // Input update
        this.input.update();

        // Camera update
        this.camera.update(dt);

        // Simulation ticks
        if (!this.state.paused) {
            const speed = CONFIG.GAME_SPEEDS[this.state.speedIndex];
            const tickInterval = CONFIG.TICK_INTERVAL / Math.max(1, speed);

            this.tickAccumulator += dt * 1000;
            while (this.tickAccumulator >= tickInterval && speed > 0) {
                this.simulation.tick();
                this.tickAccumulator -= tickInterval;
            }
        }

        // Update game state for renderer
        const inputState = this.input.getState();
        this.state.hoveredTile = inputState.hoveredTile;

        // Render
        this.renderer.render(this.state);

        // Draw FPS counter
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
        this.ctx.fillRect(5, this.canvas.height - 25, 70, 20);
        this.ctx.fillStyle = '#0f0';
        this.ctx.font = '11px monospace';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`FPS: ${this.fps}`, 10, this.canvas.height - 10);

        // Tile coordinates display
        if (this.state.hoveredTile) {
            const hx = this.state.hoveredTile.x;
            const hy = this.state.hoveredTile.y;
            if (hx >= 0 && hy >= 0 && hx < CONFIG.MAP_WIDTH && hy < CONFIG.MAP_HEIGHT) {
                this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
                this.ctx.fillRect(80, this.canvas.height - 25, 80, 20);
                this.ctx.fillStyle = '#fff';
                this.ctx.fillText(`Tile: ${hx},${hy}`, 85, this.canvas.height - 10);
            }
        }

        // Update UI HUD
        this.ui.update();

        requestAnimationFrame((t) => this._gameLoop(t));
    }

    // ---- BUILDING PLACEMENT ----
    selectBuilding(type) {
        this.state.selectedBuilding = type;
        this.state.demolishMode = false;
        this.audio.playClick();
    }

    cancelSelection() {
        this.state.selectedBuilding = null;
        this.state.demolishMode = false;
        // Deselect UI
        document.querySelectorAll('.building-item').forEach(i => i.classList.remove('selected'));
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        this.ui.selectedCategory = null;
        this.ui.elements.buildingPanel.classList.remove('open');
        this.ui.elements.buildingPanel.innerHTML = '';
    }

    tryPlaceBuilding(tileX, tileY) {
        const type = this.state.selectedBuilding;
        if (!type) return;

        const def = BUILDINGS[type];
        if (!def) return;

        // Check affordability
        if (!this.economy.canAfford(def.cost)) {
            this.ui.addNotification(`Not enough money for ${def.name}!`, 'warning');
            this.audio.playError();
            return;
        }

        // Check placement validity
        if (!this.map.canPlace(type, tileX, tileY)) {
            // For roads, silently fail (painting mode)
            if (type !== 'road') {
                this.audio.playError();
            }
            return;
        }

        // Place it
        this.economy.spend(def.cost);
        const building = this.map.placeBuilding(type, tileX, tileY);

        // Visual feedback
        const ts = CONFIG.TILE_SIZE;
        const px = (tileX + def.size[0] / 2) * ts;
        const py = (tileY + def.size[1] / 2) * ts;
        for (let i = 0; i < 5; i++) {
            this.renderer.addParticle(px, py, 'build');
        }

        this.audio.playBuild();

        // For non-road buildings, deselect after placement (unless shift is held)
        if (type !== 'road' && !this.input.keysDown.has('shift')) {
            // Keep selection for convenience
        }
    }

    // ---- DEMOLISH ----
    toggleDemolish() {
        this.state.demolishMode = !this.state.demolishMode;
        if (this.state.demolishMode) {
            this.state.selectedBuilding = null;
            document.querySelectorAll('.building-item').forEach(i => i.classList.remove('selected'));
            document.querySelectorAll('.cat-btn:not(.demolish-btn)').forEach(b => b.classList.remove('active'));
            this.ui.selectedCategory = null;
        }
        this.audio.playClick();
    }

    tryDemolish(tileX, tileY) {
        const building = this.map.getBuilding(tileX, tileY);
        if (!building) return;

        const def = building.def;
        const refund = Math.floor(def.cost * 0.5);

        // Remove building
        this.map.removeBuilding(building.x, building.y);
        this.economy.earn(refund);

        // Visual feedback
        const ts = CONFIG.TILE_SIZE;
        const px = (building.x + building.width / 2) * ts;
        const py = (building.y + building.height / 2) * ts;
        for (let i = 0; i < 8; i++) {
            this.renderer.addParticle(px, py, 'demolish');
        }

        this.ui.addNotification(`🗑️ Demolished ${def.name}. Refund: ${Utils.formatMoney(refund)}`, 'info');
        this.audio.playDemolish();

        // Close info panel if open
        this.ui.elements.infoPanel.classList.add('hidden');
    }

    // ---- INSPECTION ----
    inspectTile(tileX, tileY) {
        const building = this.map.getBuilding(tileX, tileY);
        if (building && building.type !== 'road') {
            this.ui.showBuildingInfo(building);
        } else {
            this.ui.elements.infoPanel.classList.add('hidden');
        }
    }

    // ---- SPEED CONTROL ----
    setSpeed(index) {
        this.state.speedIndex = Utils.clamp(index, 0, CONFIG.GAME_SPEEDS.length - 1);
        this.state.paused = (this.state.speedIndex === 0);
        this.audio.playClick();
    }

    togglePause() {
        if (this.state.speedIndex === 0) {
            this.state.speedIndex = 1;
            this.state.paused = false;
        } else {
            this.state.speedIndex = 0;
            this.state.paused = true;
        }
        this.ui.addNotification(this.state.paused ? '⏸ Game Paused' : '▶ Game Resumed', 'info');
    }

    // ---- SAVE / LOAD ----
    saveGame() {
        try {
            const data = {
                version: 1,
                map: this.map.serialize(),
                economy: this.economy.serialize(),
                timestamp: Date.now(),
            };
            localStorage.setItem('megacity_save', JSON.stringify(data));
            this.ui.addNotification('💾 Game saved!', 'success');
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            this.ui.addNotification('❌ Save failed!', 'danger');
            return false;
        }
    }

    loadGame() {
        try {
            const raw = localStorage.getItem('megacity_save');
            if (!raw) return false;

            const data = JSON.parse(raw);
            if (!data || data.version !== 1) return false;

            // Reconstruct game state
            this.map = GameMap.deserialize(data.map);
            this.economy = Economy.deserialize(data.economy);
            this.simulation = new Simulation(this.map, this.economy);
            this.camera = new Camera(this.canvas);
            this.renderer = new Renderer(this.canvas, this.camera, this.map);
            this.input = new InputHandler(this.canvas, this.camera, this);

            this.audio.init();
            this.camera.centerOnMap();

            // Re-bind simulation events
            this.simulation.events.on('milestone', (d) => {
                this.ui.addNotification(d.message, 'success');
                this.audio.playMilestone();
            });
            this.simulation.events.on('crisis', (d) => this.ui.addNotification(d.message, 'danger'));
            this.simulation.events.on('disaster', (d) => {
                this.ui.addNotification(d.message, 'danger');
                this.audio.playDisaster();
            });
            this.simulation.events.on('notification', (d) => this.ui.addNotification(d.message, d.type));
            this.simulation.events.on('monthEnd', () => {
                if (this.economy.month % 6 === 0) this.saveGame();
            });

            this.state.running = true;
            this.state.paused = false;
            this.lastFrameTime = performance.now();

            this.ui.addNotification('📂 Game loaded! Welcome back, Mayor!', 'success');

            this._gameLoop(performance.now());
            return true;
        } catch (e) {
            console.error('Load failed:', e);
            return false;
        }
    }
}

// ---- BOOTSTRAP ----
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new Game();
});
