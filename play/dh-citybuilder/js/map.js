// ============================================================
// MegaCity Builder - Map (Terrain & Tile Grid)
// ============================================================

class GameMap {
    constructor(width, height, seed) {
        this.width = width;
        this.height = height;
        this.seed = seed || Math.random() * 65536;
        this.tiles = [];
        this.buildings = [];       // Array of placed building instances
        this.buildingGrid = [];    // 2D array: reference to building at each tile
        this.terrainGrid = [];     // 2D lookup for terrain type
        this.treeGrid = [];        // Trees on tiles
        this.pollutionGrid = [];   // Pollution levels
        this.serviceCoverage = {   // service coverage maps
            safety: [],
            fire: [],
            health: [],
            education: [],
            happiness: [],
        };

        this._generate();
    }

    _generate() {
        const noise = new SimplexNoise(this.seed);
        const noise2 = new SimplexNoise(this.seed + 1000);
        const scale = CONFIG.TERRAIN.NOISE_SCALE;

        for (let y = 0; y < this.height; y++) {
            this.tiles[y] = [];
            this.buildingGrid[y] = [];
            this.terrainGrid[y] = [];
            this.treeGrid[y] = [];
            this.pollutionGrid[y] = [];
            for (const key in this.serviceCoverage) {
                if (!this.serviceCoverage[key][y]) this.serviceCoverage[key][y] = [];
            }

            for (let x = 0; x < this.width; x++) {
                // Generate terrain using fractal noise
                const elevation = noise.fbm(x * scale, y * scale, CONFIG.TERRAIN.NOISE_OCTAVES);
                const moisture = noise2.fbm(x * scale * 1.5 + 500, y * scale * 1.5 + 500, 3);

                let terrain = 'grass';
                if (elevation < CONFIG.TERRAIN.WATER_LEVEL) {
                    terrain = 'water';
                } else if (elevation < CONFIG.TERRAIN.SAND_LEVEL) {
                    terrain = 'sand';
                }

                // Trees on grass tiles
                let tree = null;
                if (terrain === 'grass' && Math.random() < CONFIG.TERRAIN.TREE_DENSITY) {
                    tree = {
                        type: Math.random() < 0.7 ? 'deciduous' : 'pine',
                        size: 0.6 + Math.random() * 0.6,
                        offsetX: (Math.random() - 0.5) * 8,
                        offsetY: (Math.random() - 0.5) * 8,
                        color: Utils.randomChoice(CONFIG.COLORS.TREE_LEAVES),
                    };
                }

                this.tiles[y][x] = {
                    x, y,
                    terrain,
                    elevation,
                    moisture,
                    grassVariant: Math.floor(Math.random() * CONFIG.COLORS.GRASS.length),
                };
                this.buildingGrid[y][x] = null;
                this.terrainGrid[y][x] = terrain;
                this.treeGrid[y][x] = tree;
                this.pollutionGrid[y][x] = 0;
                for (const key in this.serviceCoverage) {
                    this.serviceCoverage[key][y][x] = 0;
                }
            }
        }
    }

    getTile(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
        return this.tiles[y][x];
    }

    getTerrain(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
        return this.terrainGrid[y][x];
    }

    getBuilding(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return null;
        return this.buildingGrid[y][x];
    }

    isWater(x, y) {
        return this.getTerrain(x, y) === 'water';
    }

    canPlace(buildingType, tileX, tileY) {
        const def = BUILDINGS[buildingType];
        if (!def) return false;

        const [w, h] = def.size;

        // Check bounds
        if (tileX < 0 || tileY < 0 || tileX + w > this.width || tileY + h > this.height) {
            return false;
        }

        // Check each tile
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                const tx = tileX + dx;
                const ty = tileY + dy;

                // Already occupied?
                if (this.buildingGrid[ty][tx] !== null) return false;

                // Water?
                if (this.isWater(tx, ty)) return false;
            }
        }

        // Check road adjacency if needed (at least one adjacent road)
        if (def.needsRoad) {
            if (!this._hasAdjacentRoad(tileX, tileY, w, h)) {
                return false;
            }
        }

        return true;
    }

    _hasAdjacentRoad(x, y, w, h) {
        // Check all edge tiles for adjacent roads
        for (let dx = -1; dx <= w; dx++) {
            // Top edge
            if (this._isRoad(x + dx, y - 1)) return true;
            // Bottom edge
            if (this._isRoad(x + dx, y + h)) return true;
        }
        for (let dy = -1; dy <= h; dy++) {
            // Left edge
            if (this._isRoad(x - 1, y + dy)) return true;
            // Right edge
            if (this._isRoad(x + w, y + dy)) return true;
        }
        return false;
    }

    _isRoad(x, y) {
        const b = this.getBuilding(x, y);
        return b && b.type === 'road';
    }

    placeBuilding(buildingType, tileX, tileY) {
        const def = BUILDINGS[buildingType];
        const [w, h] = def.size;

        const building = {
            id: Date.now() + Math.random(),
            type: buildingType,
            x: tileX,
            y: tileY,
            width: w,
            height: h,
            def: def,
            active: true,
            powered: false,
            watered: false,
            occupancy: 0,
            level: 1,
            placedAt: Date.now(),
            age: 0,
        };

        // Place on grid
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                this.buildingGrid[tileY + dy][tileX + dx] = building;
                this.treeGrid[tileY + dy][tileX + dx] = null; // Remove trees
            }
        }

        this.buildings.push(building);

        // Update service coverage if applicable
        if (def.serviceRadius && def.serviceType) {
            this._updateServiceCoverage(building);
        }
        if (def.pollution) {
            this._updatePollution(building, 1);
        }

        return building;
    }

    removeBuilding(tileX, tileY) {
        const building = this.getBuilding(tileX, tileY);
        if (!building) return null;

        const { x, y, width, height, def } = building;

        // Remove from grid
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                this.buildingGrid[y + dy][x + dx] = null;
            }
        }

        // Remove from buildings array
        const idx = this.buildings.indexOf(building);
        if (idx !== -1) this.buildings.splice(idx, 1);

        // Recalculate services
        if (def.serviceRadius && def.serviceType) {
            this._recalcServiceCoverage(def.serviceType);
        }
        if (def.pollution) {
            this._updatePollution(building, -1);
        }

        return building;
    }

    _updateServiceCoverage(building) {
        const { x, y, width, height, def } = building;
        const radius = def.serviceRadius;
        const type = def.serviceType;
        const cx = x + width / 2;
        const cy = y + height / 2;

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const tx = Math.floor(cx + dx);
                const ty = Math.floor(cy + dy);
                if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) continue;

                const dist = Utils.distance(cx, cy, tx + 0.5, ty + 0.5);
                if (dist <= radius) {
                    const strength = 1 - (dist / radius) * CONFIG.SERVICES.COVERAGE_DECAY;
                    this.serviceCoverage[type][ty][tx] = Math.min(1,
                        this.serviceCoverage[type][ty][tx] + Math.max(0, strength));
                }
            }
        }
    }

    _recalcServiceCoverage(type) {
        // Reset
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.serviceCoverage[type][y][x] = 0;
            }
        }
        // Reapply all buildings of this type
        for (const b of this.buildings) {
            if (b.def.serviceType === type && b.def.serviceRadius) {
                this._updateServiceCoverage(b);
            }
        }
    }

    _updatePollution(building, multiplier = 1) {
        const { x, y, width, height, def } = building;
        const pollution = (def.pollution || 0) * multiplier;
        const radius = 6;
        const cx = x + width / 2;
        const cy = y + height / 2;

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const tx = Math.floor(cx + dx);
                const ty = Math.floor(cy + dy);
                if (tx < 0 || ty < 0 || tx >= this.width || ty >= this.height) continue;

                const dist = Utils.distance(cx, cy, tx + 0.5, ty + 0.5);
                if (dist <= radius) {
                    const strength = pollution * (1 - dist / radius);
                    this.pollutionGrid[ty][tx] = Math.max(0,
                        this.pollutionGrid[ty][tx] + strength);
                }
            }
        }
    }

    // Get road connection directions for proper road rendering
    getRoadConnections(x, y) {
        return {
            north: this._isRoad(x, y - 1),
            south: this._isRoad(x, y + 1),
            east:  this._isRoad(x + 1, y),
            west:  this._isRoad(x - 1, y),
        };
    }

    // Count totals for stats
    getStats() {
        let totalCapacity = 0;
        let totalJobs = 0;
        let totalIncome = 0;
        let totalMaintenance = 0;
        let totalPowerOutput = 0;
        let totalPowerDemand = 0;
        let totalWaterOutput = 0;
        let totalWaterDemand = 0;

        for (const b of this.buildings) {
            const d = b.def;
            totalCapacity += d.capacity || 0;
            totalJobs += d.jobs || 0;
            totalIncome += d.income || 0;
            totalMaintenance += d.maintenance || 0;
            totalPowerOutput += d.powerOutput || 0;
            totalPowerDemand += d.needsPower || 0;
            totalWaterOutput += d.waterOutput || 0;
            totalWaterDemand += d.needsWater || 0;
        }

        return {
            totalCapacity,
            totalJobs,
            totalIncome,
            totalMaintenance,
            totalPowerOutput,
            totalPowerDemand,
            totalWaterOutput,
            totalWaterDemand,
            buildingCount: this.buildings.length,
        };
    }

    // Serialize for save
    serialize() {
        return {
            width: this.width,
            height: this.height,
            seed: this.seed,
            buildings: this.buildings.map(b => ({
                type: b.type,
                x: b.x,
                y: b.y,
                occupancy: b.occupancy,
                level: b.level,
                age: b.age,
            })),
        };
    }

    // Load from saved data
    static deserialize(data) {
        const map = new GameMap(data.width, data.height, data.seed);
        for (const bd of data.buildings) {
            const b = map.placeBuilding(bd.type, bd.x, bd.y);
            if (b) {
                b.occupancy = bd.occupancy || 0;
                b.level = bd.level || 1;
                b.age = bd.age || 0;
            }
        }
        return map;
    }
}
