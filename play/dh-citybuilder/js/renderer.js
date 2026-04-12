// ============================================================
// MegaCity Builder - Canvas Renderer
// ============================================================

class Renderer {
    constructor(canvas, camera, map) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.camera = camera;
        this.map = map;
        this.animTime = 0;
        this.dayNightCycle = 0.5; // 0=midnight, 0.5=noon, 1=midnight

        // Cached terrain canvas (pre-rendered)
        this.terrainCanvas = null;
        this.terrainDirty = true;

        // Particle effects
        this.particles = [];
    }

    // Full render frame
    render(gameState) {
        const ctx = this.ctx;
        this.animTime += 0.016;

        // Clear
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.fillStyle = '#1a3a1a';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Apply camera
        this.camera.applyTransform(ctx);

        // Get visible tiles for culling
        const visible = this.camera.getVisibleTiles();

        // Draw layers
        this._drawTerrain(ctx, visible);
        this._drawGrid(ctx, visible);
        this._drawBuildings(ctx, visible);
        this._drawPlacementPreview(ctx, gameState);
        this._drawParticles(ctx);

        // Reset transform for UI overlay elements
        this.camera.resetTransform(ctx);
        this._drawMinimap(ctx);
    }

    // ---- TERRAIN DRAWING ----
    _drawTerrain(ctx, visible) {
        const ts = CONFIG.TILE_SIZE;
        const map = this.map;

        for (let y = visible.startY; y <= visible.endY; y++) {
            for (let x = visible.startX; x <= visible.endX; x++) {
                const tile = map.getTile(x, y);
                if (!tile) continue;

                const px = x * ts;
                const py = y * ts;

                // Base terrain
                if (tile.terrain === 'water') {
                    this._drawWater(ctx, px, py, ts, x, y);
                } else if (tile.terrain === 'sand') {
                    ctx.fillStyle = CONFIG.COLORS.WATER_SHORE;
                    ctx.fillRect(px, py, ts, ts);
                    // Sand texture dots
                    ctx.fillStyle = 'rgba(200,170,80,0.3)';
                    for (let i = 0; i < 3; i++) {
                        const sx = px + ((x * 7 + i * 13) % ts);
                        const sy = py + ((y * 11 + i * 17) % ts);
                        ctx.fillRect(sx, sy, 1, 1);
                    }
                } else {
                    // Grass with variation
                    const variant = tile.grassVariant;
                    ctx.fillStyle = CONFIG.COLORS.GRASS[variant];
                    ctx.fillRect(px, py, ts, ts);

                    // Subtle grass texture
                    const darkGrass = CONFIG.COLORS.GRASS_DARK[variant];
                    ctx.fillStyle = darkGrass;
                    const gx = (x * 37 + y * 53) % 7;
                    const gy = (x * 41 + y * 59) % 7;
                    ctx.fillRect(px + gx * 4, py + gy * 4, 2, 1);
                    ctx.fillRect(px + ((gx + 3) % 7) * 4, py + ((gy + 4) % 7) * 4, 1, 2);
                }

                // Draw tree if present and no building
                const tree = map.treeGrid[y][x];
                const building = map.buildingGrid[y][x];
                if (tree && !building) {
                    this._drawTree(ctx, px, py, ts, tree);
                }

                // Pollution overlay
                const pollution = map.pollutionGrid[y][x];
                if (pollution > 0.5) {
                    const alpha = Math.min(0.35, pollution * 0.02);
                    ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`;
                    ctx.fillRect(px, py, ts, ts);
                }
            }
        }
    }

    _drawWater(ctx, px, py, ts, tileX, tileY) {
        const wave = Math.sin(this.animTime * 2 + tileX * 0.5 + tileY * 0.3) * 0.5 + 0.5;
        const colorIdx = Math.floor(wave * CONFIG.COLORS.WATER.length) % CONFIG.COLORS.WATER.length;
        ctx.fillStyle = CONFIG.COLORS.WATER[colorIdx];
        ctx.fillRect(px, py, ts, ts);

        // Water shimmer
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        const shimmerX = px + Math.sin(this.animTime * 3 + tileX) * 4 + ts / 2;
        const shimmerY = py + Math.cos(this.animTime * 2.5 + tileY) * 3 + ts / 2;
        ctx.beginPath();
        ctx.ellipse(shimmerX, shimmerY, 3, 1.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawTree(ctx, px, py, ts, tree) {
        const cx = px + ts / 2 + tree.offsetX;
        const cy = py + ts / 2 + tree.offsetY;
        const size = tree.size * ts * 0.35;

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(cx + 2, cy + size * 0.8, size * 0.6, size * 0.25, 0, 0, Math.PI * 2);
        ctx.fill();

        if (tree.type === 'pine') {
            // Pine tree - triangle shape
            ctx.fillStyle = CONFIG.COLORS.TREE_TRUNK;
            ctx.fillRect(cx - 1, cy, 2, size * 0.6);

            ctx.fillStyle = tree.color;
            ctx.beginPath();
            ctx.moveTo(cx, cy - size * 0.8);
            ctx.lineTo(cx - size * 0.5, cy + size * 0.1);
            ctx.lineTo(cx + size * 0.5, cy + size * 0.1);
            ctx.closePath();
            ctx.fill();

            // Second layer
            ctx.beginPath();
            ctx.moveTo(cx, cy - size * 0.5);
            ctx.lineTo(cx - size * 0.4, cy + size * 0.3);
            ctx.lineTo(cx + size * 0.4, cy + size * 0.3);
            ctx.closePath();
            ctx.fill();
        } else {
            // Deciduous tree - round canopy
            ctx.fillStyle = CONFIG.COLORS.TREE_TRUNK;
            ctx.fillRect(cx - 1.5, cy - size * 0.1, 3, size * 0.7);

            ctx.fillStyle = tree.color;
            ctx.beginPath();
            ctx.arc(cx, cy - size * 0.3, size * 0.55, 0, Math.PI * 2);
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.beginPath();
            ctx.arc(cx - size * 0.15, cy - size * 0.45, size * 0.25, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // ---- GRID OVERLAY ----
    _drawGrid(ctx, visible) {
        const ts = CONFIG.TILE_SIZE;
        ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        ctx.lineWidth = 0.5;

        ctx.beginPath();
        for (let x = visible.startX; x <= visible.endX + 1; x++) {
            ctx.moveTo(x * ts, visible.startY * ts);
            ctx.lineTo(x * ts, (visible.endY + 1) * ts);
        }
        for (let y = visible.startY; y <= visible.endY + 1; y++) {
            ctx.moveTo(visible.startX * ts, y * ts);
            ctx.lineTo((visible.endX + 1) * ts, y * ts);
        }
        ctx.stroke();
    }

    // ---- BUILDING DRAWING ----
    _drawBuildings(ctx, visible) {
        const ts = CONFIG.TILE_SIZE;
        const drawn = new Set(); // Avoid drawing multi-tile buildings multiple times

        for (let y = visible.startY; y <= visible.endY; y++) {
            for (let x = visible.startX; x <= visible.endX; x++) {
                const building = this.map.buildingGrid[y]?.[x];
                if (!building || drawn.has(building.id)) continue;
                drawn.add(building.id);

                const px = building.x * ts;
                const py = building.y * ts;
                const bw = building.width * ts;
                const bh = building.height * ts;

                if (building.type === 'road') {
                    this._drawRoad(ctx, building.x, building.y, ts);
                } else {
                    this._drawBuildingSprite(ctx, building, px, py, bw, bh, ts);
                }
            }
        }
    }

    _drawRoad(ctx, tileX, tileY, ts) {
        const px = tileX * ts;
        const py = tileY * ts;
        const conn = this.map.getRoadConnections(tileX, tileY);

        // Road base
        ctx.fillStyle = CONFIG.COLORS.ROAD;
        ctx.fillRect(px, py, ts, ts);

        // Sidewalk edges
        ctx.fillStyle = CONFIG.COLORS.SIDEWALK;
        const sw = 3; // sidewalk width

        if (!conn.north) ctx.fillRect(px, py, ts, sw);
        if (!conn.south) ctx.fillRect(px, py + ts - sw, ts, sw);
        if (!conn.west)  ctx.fillRect(px, py, sw, ts);
        if (!conn.east)  ctx.fillRect(px + ts - sw, py, sw, ts);

        // Center road markings
        ctx.fillStyle = CONFIG.COLORS.ROAD_MARKING;
        const center = ts / 2;

        if (conn.north || conn.south) {
            // Vertical dashed line
            for (let i = 2; i < ts - 2; i += 6) {
                ctx.fillRect(px + center - 0.5, py + i, 1, 3);
            }
        }
        if (conn.east || conn.west) {
            // Horizontal dashed line
            for (let i = 2; i < ts - 2; i += 6) {
                ctx.fillRect(px + i, py + center - 0.5, 3, 1);
            }
        }
    }

    _drawBuildingSprite(ctx, building, px, py, bw, bh, ts) {
        const def = building.def;
        const type = building.type;
        const height = def.height || 16;

        // Building shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.fillRect(px + 3, py + 3, bw, bh);

        // Call specific drawing functions based on building category/type
        switch (type) {
            case 'house': this._drawHouse(ctx, px, py, bw, bh, building); break;
            case 'apartment': this._drawApartment(ctx, px, py, bw, bh, building); break;
            case 'tower': this._drawTower(ctx, px, py, bw, bh, building); break;
            case 'shop': this._drawShop(ctx, px, py, bw, bh, building); break;
            case 'mall': this._drawMall(ctx, px, py, bw, bh, building); break;
            case 'office': this._drawOffice(ctx, px, py, bw, bh, building); break;
            case 'factory': this._drawFactory(ctx, px, py, bw, bh, building); break;
            case 'warehouse': this._drawWarehouse(ctx, px, py, bw, bh, building); break;
            case 'police': this._drawServiceBuilding(ctx, px, py, bw, bh, building, '#2c3e50', '🚔'); break;
            case 'fire_station': this._drawServiceBuilding(ctx, px, py, bw, bh, building, '#c0392b', '🚒'); break;
            case 'hospital': this._drawHospital(ctx, px, py, bw, bh, building); break;
            case 'school': this._drawSchool(ctx, px, py, bw, bh, building); break;
            case 'power_plant': this._drawPowerPlant(ctx, px, py, bw, bh, building); break;
            case 'solar_farm': this._drawSolarFarm(ctx, px, py, bw, bh, building); break;
            case 'wind_turbine': this._drawWindTurbine(ctx, px, py, bw, bh, building); break;
            case 'water_tower': this._drawWaterTower(ctx, px, py, bw, bh, building); break;
            case 'water_pump': this._drawWaterPump(ctx, px, py, bw, bh, building); break;
            case 'park': this._drawPark(ctx, px, py, bw, bh, building); break;
            case 'stadium': this._drawStadium(ctx, px, py, bw, bh, building); break;
            case 'fountain': this._drawFountain(ctx, px, py, bw, bh, building); break;
            case 'monument': this._drawMonument(ctx, px, py, bw, bh, building); break;
            default: this._drawGenericBuilding(ctx, px, py, bw, bh, building); break;
        }

        // Inactive indicator (no power/water)
        if (!building.active && building.def.needsPower > 0) {
            ctx.fillStyle = 'rgba(255,0,0,0.25)';
            ctx.fillRect(px, py, bw, bh);
            // Flash warning icon
            if (Math.sin(this.animTime * 5) > 0) {
                ctx.font = `${Math.min(bw, bh) * 0.4}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⚠️', px + bw / 2, py + bh / 2);
            }
        }
    }

    // ---- SPECIFIC BUILDING DRAWINGS ----

    _drawHouse(ctx, px, py, bw, bh, b) {
        const m = 3; // margin
        // Wall
        ctx.fillStyle = b.def.wallColor;
        ctx.fillRect(px + m, py + bh * 0.35, bw - m * 2, bh * 0.65 - m);

        // Roof (triangle)
        ctx.fillStyle = b.def.roofColor;
        ctx.beginPath();
        ctx.moveTo(px + bw / 2, py + m);
        ctx.lineTo(px + m - 2, py + bh * 0.4);
        ctx.lineTo(px + bw - m + 2, py + bh * 0.4);
        ctx.closePath();
        ctx.fill();

        // Door
        ctx.fillStyle = '#5D4037';
        ctx.fillRect(px + bw / 2 - 2, py + bh * 0.7, 4, bh * 0.3 - m);

        // Window
        ctx.fillStyle = '#85C1E9';
        ctx.fillRect(px + m + 3, py + bh * 0.45, 4, 4);
        ctx.fillRect(px + bw - m - 7, py + bh * 0.45, 4, 4);

        // Chimney
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(px + bw * 0.7, py + m + 2, 3, bh * 0.2);
    }

    _drawApartment(ctx, px, py, bw, bh, b) {
        const m = 4;
        // Main structure
        ctx.fillStyle = b.def.wallColor;
        ctx.fillRect(px + m, py + m, bw - m * 2, bh - m * 2);

        // Roof
        ctx.fillStyle = b.def.roofColor;
        ctx.fillRect(px + m, py + m, bw - m * 2, 6);

        // Windows grid
        ctx.fillStyle = '#85C1E9';
        const wSize = 4;
        const wGap = 6;
        for (let wy = py + m + 10; wy < py + bh - m - 4; wy += wGap + wSize) {
            for (let wx = px + m + 4; wx < px + bw - m - 4; wx += wGap + wSize) {
                // Some windows lit
                const lit = ((wx * 7 + wy * 13) % 5) > 1;
                ctx.fillStyle = lit ? '#F9E79F' : '#85C1E9';
                ctx.fillRect(wx, wy, wSize, wSize);
            }
        }

        // Door
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(px + bw / 2 - 4, py + bh - m - 8, 8, 8);

        // Border
        ctx.strokeStyle = Utils.darkenColor(b.def.wallColor, 30);
        ctx.lineWidth = 1;
        ctx.strokeRect(px + m, py + m, bw - m * 2, bh - m * 2);
    }

    _drawTower(ctx, px, py, bw, bh, b) {
        const m = 6;
        // Glass tower
        const grad = ctx.createLinearGradient(px + m, py, px + bw - m, py);
        grad.addColorStop(0, '#a9cce3');
        grad.addColorStop(0.5, '#d6eaf8');
        grad.addColorStop(1, '#85c1e9');
        ctx.fillStyle = grad;
        ctx.fillRect(px + m, py + m, bw - m * 2, bh - m * 2);

        // Spire on top
        ctx.fillStyle = '#5dade2';
        ctx.beginPath();
        ctx.moveTo(px + bw / 2, py - 4);
        ctx.lineTo(px + bw / 2 - 6, py + m);
        ctx.lineTo(px + bw / 2 + 6, py + m);
        ctx.closePath();
        ctx.fill();

        // Floor lines
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 0.5;
        for (let fy = py + m + 8; fy < py + bh - m; fy += 6) {
            ctx.beginPath();
            ctx.moveTo(px + m, fy);
            ctx.lineTo(px + bw - m, fy);
            ctx.stroke();
        }

        // Windows
        ctx.fillStyle = 'rgba(255,255,200,0.5)';
        for (let wy = py + m + 4; wy < py + bh - m - 4; wy += 6) {
            for (let wx = px + m + 4; wx < px + bw - m - 4; wx += 8) {
                ctx.fillRect(wx, wy, 3, 4);
            }
        }

        // Border
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + m, py + m, bw - m * 2, bh - m * 2);
    }

    _drawShop(ctx, px, py, bw, bh, b) {
        const m = 2;
        // Wall
        ctx.fillStyle = b.def.wallColor;
        ctx.fillRect(px + m, py + m, bw - m * 2, bh - m * 2);

        // Awning
        ctx.fillStyle = '#e74c3c';
        ctx.fillRect(px + m - 1, py + bh * 0.3, bw - m * 2 + 2, 5);

        // Awning stripes
        ctx.fillStyle = '#fff';
        for (let sx = px + m; sx < px + bw - m; sx += 6) {
            ctx.fillRect(sx, py + bh * 0.3, 3, 5);
        }

        // Store window
        ctx.fillStyle = '#85c1e9';
        ctx.fillRect(px + m + 2, py + bh * 0.3 + 7, bw - m * 2 - 4, bh * 0.4);

        // Door
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(px + bw / 2 - 3, py + bh - m - 6, 6, 6);

        // Sign
        ctx.fillStyle = '#f39c12';
        ctx.fillRect(px + m + 2, py + m + 2, bw - m * 2 - 4, bh * 0.2);
    }

    _drawMall(ctx, px, py, bw, bh, b) {
        const m = 4;
        // Main structure
        ctx.fillStyle = b.def.wallColor;
        ctx.fillRect(px + m, py + m + 8, bw - m * 2, bh - m * 2 - 8);

        // Curved roof line
        ctx.fillStyle = b.def.roofColor;
        ctx.beginPath();
        ctx.moveTo(px + m, py + m + 8);
        ctx.quadraticCurveTo(px + bw / 2, py, px + bw - m, py + m + 8);
        ctx.lineTo(px + bw - m, py + m + 14);
        ctx.quadraticCurveTo(px + bw / 2, py + 6, px + m, py + m + 14);
        ctx.closePath();
        ctx.fill();

        // Large windows
        ctx.fillStyle = '#aed6f1';
        for (let wx = px + m + 6; wx < px + bw - m - 6; wx += 12) {
            ctx.fillRect(wx, py + m + 18, 8, bh * 0.5);
        }

        // Entrance
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(px + bw / 2 - 8, py + bh - m - 12, 16, 12);

        // "MALL" text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 7px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('MALL', px + bw / 2, py + m + 6);
    }

    _drawOffice(ctx, px, py, bw, bh, b) {
        const m = 5;
        // Glass façade
        const grad = ctx.createLinearGradient(px, py, px + bw, py + bh);
        grad.addColorStop(0, '#aed6f1');
        grad.addColorStop(1, '#5dade2');
        ctx.fillStyle = grad;
        ctx.fillRect(px + m, py + m, bw - m * 2, bh - m * 2);

        // Floor separators
        ctx.strokeStyle = '#2980b9';
        ctx.lineWidth = 1;
        for (let fy = py + m; fy < py + bh - m; fy += 8) {
            ctx.beginPath();
            ctx.moveTo(px + m, fy);
            ctx.lineTo(px + bw - m, fy);
            ctx.stroke();
        }

        // Vertical column
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(px + bw / 2 - 1, py + m, 2, bh - m * 2);

        // Rooftop
        ctx.fillStyle = b.def.roofColor;
        ctx.fillRect(px + m, py + m, bw - m * 2, 4);

        // Antenna
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(px + bw / 2 - 0.5, py - 4, 1, m + 4);
    }

    _drawFactory(ctx, px, py, bw, bh, b) {
        const m = 4;
        // Main building
        ctx.fillStyle = b.def.wallColor;
        ctx.fillRect(px + m, py + bh * 0.3, bw - m * 2, bh * 0.7 - m);

        // Saw-tooth roof
        ctx.fillStyle = b.def.roofColor;
        const teeth = 3;
        const toothW = (bw - m * 2) / teeth;
        for (let i = 0; i < teeth; i++) {
            ctx.beginPath();
            ctx.moveTo(px + m + i * toothW, py + bh * 0.3);
            ctx.lineTo(px + m + i * toothW + toothW * 0.3, py + m);
            ctx.lineTo(px + m + (i + 1) * toothW, py + bh * 0.3);
            ctx.closePath();
            ctx.fill();
        }

        // Smokestacks
        ctx.fillStyle = '#5d6d7e';
        ctx.fillRect(px + bw * 0.7, py + m, 5, bh * 0.25);
        ctx.fillRect(px + bw * 0.82, py + m + 3, 4, bh * 0.22);

        // Smoke particles
        if (b.active) {
            ctx.fillStyle = 'rgba(150,150,150,0.4)';
            for (let i = 0; i < 3; i++) {
                const sy = py + m - 3 - i * 4 - Math.sin(this.animTime * 2 + i) * 2;
                const sx = px + bw * 0.72 + Math.cos(this.animTime + i * 1.5) * 3;
                ctx.beginPath();
                ctx.arc(sx, sy, 2.5 + i, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Loading dock
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(px + m + 4, py + bh - m - 8, 10, 8);
        ctx.fillRect(px + bw - m - 14, py + bh - m - 8, 10, 8);

        // Windows
        ctx.fillStyle = '#f9e79f';
        for (let wx = px + m + 4; wx < px + bw - m - 4; wx += 10) {
            ctx.fillRect(wx, py + bh * 0.4, 4, 4);
        }
    }

    _drawWarehouse(ctx, px, py, bw, bh, b) {
        const m = 3;
        // Metal structure
        ctx.fillStyle = b.def.wallColor;
        ctx.fillRect(px + m, py + m + 4, bw - m * 2, bh - m * 2 - 4);

        // Curved roof
        ctx.fillStyle = b.def.roofColor;
        ctx.beginPath();
        ctx.moveTo(px + m, py + m + 4);
        ctx.quadraticCurveTo(px + bw / 2, py - 2, px + bw - m, py + m + 4);
        ctx.lineTo(px + bw - m, py + m + 8);
        ctx.quadraticCurveTo(px + bw / 2, py + 2, px + m, py + m + 8);
        ctx.closePath();
        ctx.fill();

        // Large garage door
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(px + bw / 2 - 8, py + bh - m - 10, 16, 10);
        // Horizontal lines on door
        ctx.strokeStyle = '#5d6d7e';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < 4; i++) {
            const dy = py + bh - m - 10 + i * 3;
            ctx.beginPath();
            ctx.moveTo(px + bw / 2 - 8, dy);
            ctx.lineTo(px + bw / 2 + 8, dy);
            ctx.stroke();
        }
    }

    _drawServiceBuilding(ctx, px, py, bw, bh, b, color, emoji) {
        const m = 4;
        ctx.fillStyle = b.def.wallColor || color;
        ctx.fillRect(px + m, py + m + 4, bw - m * 2, bh - m * 2 - 4);

        ctx.fillStyle = b.def.roofColor || Utils.darkenColor(color, 30);
        ctx.fillRect(px + m, py + m, bw - m * 2, 8);

        // Windows
        ctx.fillStyle = '#f9e79f';
        for (let wy = py + m + 14; wy < py + bh - m - 6; wy += 8) {
            for (let wx = px + m + 4; wx < px + bw - m - 4; wx += 8) {
                ctx.fillRect(wx, wy, 4, 4);
            }
        }

        // Entrance
        ctx.fillStyle = '#1a252f';
        ctx.fillRect(px + bw / 2 - 5, py + bh - m - 8, 10, 8);

        // Icon
        ctx.font = `${Math.min(bw, bh) * 0.25}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, px + bw / 2, py + bh * 0.3);
    }

    _drawHospital(ctx, px, py, bw, bh, b) {
        const m = 4;
        // White building
        ctx.fillStyle = '#f2f3f4';
        ctx.fillRect(px + m, py + m, bw - m * 2, bh - m * 2);

        // Red cross
        ctx.fillStyle = '#e74c3c';
        const crossSize = Math.min(bw, bh) * 0.15;
        const cx = px + bw / 2;
        const cy = py + bh * 0.3;
        ctx.fillRect(cx - crossSize / 2, cy - crossSize * 1.5, crossSize, crossSize * 3);
        ctx.fillRect(cx - crossSize * 1.5, cy - crossSize / 2, crossSize * 3, crossSize);

        // Windows
        ctx.fillStyle = '#aed6f1';
        for (let wy = py + bh * 0.5; wy < py + bh - m - 6; wy += 7) {
            for (let wx = px + m + 4; wx < px + bw - m - 4; wx += 8) {
                ctx.fillRect(wx, wy, 4, 4);
            }
        }

        // Entrance
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(px + bw / 2 - 6, py + bh - m - 8, 12, 8);

        // Roof line
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(px + m, py + m, bw - m * 2, 4);
    }

    _drawSchool(ctx, px, py, bw, bh, b) {
        const m = 4;
        // Building
        ctx.fillStyle = '#fdebd0';
        ctx.fillRect(px + m, py + m + 8, bw - m * 2, bh - m * 2 - 8);

        // Orange roof
        ctx.fillStyle = '#e67e22';
        ctx.fillRect(px + m - 2, py + m + 4, bw - m * 2 + 4, 8);

        // Bell tower center
        ctx.fillStyle = '#d4ac0d';
        ctx.fillRect(px + bw / 2 - 4, py, 8, m + 8);
        // Bell
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.arc(px + bw / 2, py + 3, 3, 0, Math.PI * 2);
        ctx.fill();

        // Windows
        ctx.fillStyle = '#85c1e9';
        for (let wy = py + m + 16; wy < py + bh - m - 6; wy += 8) {
            for (let wx = px + m + 4; wx < px + bw - m - 4; wx += 8) {
                ctx.fillRect(wx, wy, 4, 5);
            }
        }

        // Playground marking
        ctx.fillStyle = '#27ae60';
        ctx.fillRect(px + bw - m - 12, py + bh - m - 3, 10, 3);
    }

    _drawPowerPlant(ctx, px, py, bw, bh, b) {
        const m = 5;
        // Main building
        ctx.fillStyle = '#808b8d';
        ctx.fillRect(px + m, py + bh * 0.3, bw - m * 2, bh * 0.7 - m);

        // Cooling towers
        ctx.fillStyle = '#95a5a6';
        const towerR = bw * 0.12;
        for (let i = 0; i < 2; i++) {
            const tx = px + bw * 0.3 + i * bw * 0.35;
            const ty = py + bh * 0.3;
            ctx.beginPath();
            ctx.moveTo(tx - towerR, ty);
            ctx.quadraticCurveTo(tx - towerR * 0.7, ty - bh * 0.2, tx - towerR * 0.8, ty - bh * 0.3);
            ctx.lineTo(tx + towerR * 0.8, ty - bh * 0.3);
            ctx.quadraticCurveTo(tx + towerR * 0.7, ty - bh * 0.2, tx + towerR, ty);
            ctx.closePath();
            ctx.fill();

            // Steam
            if (b.active) {
                ctx.fillStyle = 'rgba(200,200,200,0.35)';
                for (let s = 0; s < 3; s++) {
                    const sy = ty - bh * 0.3 - s * 5 - Math.sin(this.animTime * 1.5 + s + i) * 2;
                    const sx = tx + Math.cos(this.animTime * 0.8 + s * 2 + i) * 3;
                    ctx.beginPath();
                    ctx.arc(sx, sy, 3 + s, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.fillStyle = '#95a5a6';
            }
        }

        // Smokestack
        ctx.fillStyle = '#5d6d7e';
        ctx.fillRect(px + bw * 0.85, py + m, 5, bh * 0.3);

        // ⚡ icon
        ctx.fillStyle = '#f39c12';
        ctx.font = `${bw * 0.15}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('⚡', px + bw / 2, py + bh * 0.6);
    }

    _drawSolarFarm(ctx, px, py, bw, bh, b) {
        const m = 4;
        // Ground
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(px + m, py + m, bw - m * 2, bh - m * 2);

        // Solar panels in grid
        const panelW = 8;
        const panelH = 6;
        const gap = 3;
        for (let py2 = py + m + 3; py2 + panelH < py + bh - m; py2 += panelH + gap) {
            for (let px2 = px + m + 3; px2 + panelW < px + bw - m; px2 += panelW + gap) {
                // Panel frame
                ctx.fillStyle = '#1a5276';
                ctx.fillRect(px2, py2, panelW, panelH);

                // Glass reflection
                ctx.fillStyle = '#2e86c1';
                ctx.fillRect(px2 + 1, py2 + 1, panelW - 2, panelH - 2);

                // Grid lines
                ctx.strokeStyle = '#1a5276';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(px2 + panelW / 2, py2);
                ctx.lineTo(px2 + panelW / 2, py2 + panelH);
                ctx.moveTo(px2, py2 + panelH / 2);
                ctx.lineTo(px2 + panelW, py2 + panelH / 2);
                ctx.stroke();

                // Shimmer
                const shimmer = Math.sin(this.animTime + px2 * 0.1 + py2 * 0.07) * 0.5 + 0.5;
                ctx.fillStyle = `rgba(255,255,255,${shimmer * 0.15})`;
                ctx.fillRect(px2 + 1, py2 + 1, panelW / 2, panelH / 2);
            }
        }
    }

    _drawWindTurbine(ctx, px, py, bw, bh, b) {
        const cx = px + bw / 2;
        const cy = py + bh / 2;

        // Base
        ctx.fillStyle = '#bdc3c7';
        ctx.beginPath();
        ctx.moveTo(cx - 4, py + bh - 3);
        ctx.lineTo(cx + 4, py + bh - 3);
        ctx.lineTo(cx + 1, py + bh * 0.2);
        ctx.lineTo(cx - 1, py + bh * 0.2);
        ctx.closePath();
        ctx.fill();

        // Blades
        ctx.save();
        ctx.translate(cx, py + bh * 0.2);
        const rotation = this.animTime * 3;
        for (let i = 0; i < 3; i++) {
            ctx.save();
            ctx.rotate(rotation + (i * Math.PI * 2) / 3);
            ctx.fillStyle = '#ecf0f1';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(-1.5, -bh * 0.35);
            ctx.lineTo(1.5, -bh * 0.35);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Hub
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    _drawWaterTower(ctx, px, py, bw, bh, b) {
        const cx = px + bw / 2;
        const m = 3;

        // Legs
        ctx.fillStyle = '#7f8c8d';
        ctx.fillRect(cx - bw * 0.3, py + bh * 0.5, 2, bh * 0.5 - m);
        ctx.fillRect(cx + bw * 0.3 - 2, py + bh * 0.5, 2, bh * 0.5 - m);
        ctx.fillRect(cx - 1, py + bh * 0.5, 2, bh * 0.5 - m);

        // Cross braces
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.moveTo(cx - bw * 0.3, py + bh * 0.65);
        ctx.lineTo(cx + bw * 0.3, py + bh * 0.8);
        ctx.moveTo(cx + bw * 0.3, py + bh * 0.65);
        ctx.lineTo(cx - bw * 0.3, py + bh * 0.8);
        ctx.stroke();

        // Tank
        ctx.fillStyle = '#3498db';
        ctx.beginPath();
        ctx.ellipse(cx, py + bh * 0.35, bw * 0.35, bh * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Tank highlight
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.ellipse(cx - 2, py + bh * 0.3, bw * 0.15, bh * 0.08, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Roof cap
        ctx.fillStyle = '#2980b9';
        ctx.beginPath();
        ctx.moveTo(cx, py + m);
        ctx.lineTo(cx - bw * 0.2, py + bh * 0.2);
        ctx.lineTo(cx + bw * 0.2, py + bh * 0.2);
        ctx.closePath();
        ctx.fill();
    }

    _drawWaterPump(ctx, px, py, bw, bh, b) {
        const m = 4;
        // Building
        ctx.fillStyle = '#5dade2';
        ctx.fillRect(px + m, py + m, bw - m * 2, bh - m * 2);

        // Pipes
        ctx.fillStyle = '#2471a3';
        ctx.fillRect(px + m, py + bh * 0.4, bw - m * 2, 4);
        ctx.fillRect(px + bw * 0.3, py + m, 4, bh - m * 2);
        ctx.fillRect(px + bw * 0.6, py + m, 4, bh - m * 2);

        // Water flow animation
        if (b.active) {
            ctx.fillStyle = 'rgba(133, 193, 233, 0.5)';
            const flowPos = (this.animTime * 20) % (bw - m * 2);
            ctx.fillRect(px + m + flowPos, py + bh * 0.4, 6, 4);
        }

        // Roof
        ctx.fillStyle = '#1a5276';
        ctx.fillRect(px + m, py + m, bw - m * 2, 5);

        // 💧 icon
        ctx.font = `${bw * 0.2}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('💧', px + bw / 2, py + bh * 0.7);
    }

    _drawPark(ctx, px, py, bw, bh, b) {
        // Green ground
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(px + 2, py + 2, bw - 4, bh - 4);

        // Lighter patches
        ctx.fillStyle = '#58d68d';
        ctx.fillRect(px + 6, py + 8, 12, 8);
        ctx.fillRect(px + bw - 18, py + bh - 16, 10, 6);

        // Path through park
        ctx.fillStyle = '#d5c4a1';
        ctx.fillRect(px + 2, py + bh / 2 - 2, bw - 4, 4);

        // Trees
        const trees = [
            { x: px + bw * 0.2, y: py + bh * 0.25 },
            { x: px + bw * 0.75, y: py + bh * 0.3 },
            { x: px + bw * 0.5, y: py + bh * 0.7 },
            { x: px + bw * 0.2, y: py + bh * 0.75 },
        ];
        for (const t of trees) {
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(t.x - 1, t.y, 2, 5);
            ctx.fillStyle = '#229954';
            ctx.beginPath();
            ctx.arc(t.x, t.y - 2, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        // Bench
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(px + bw * 0.4, py + bh / 2 + 4, 8, 2);
        ctx.fillRect(px + bw * 0.4, py + bh / 2 + 4, 1, 3);
        ctx.fillRect(px + bw * 0.4 + 7, py + bh / 2 + 4, 1, 3);

        // Border
        ctx.strokeStyle = '#1e8449';
        ctx.lineWidth = 1;
        ctx.strokeRect(px + 2, py + 2, bw - 4, bh - 4);
    }

    _drawStadium(ctx, px, py, bw, bh, b) {
        const m = 4;
        const cx = px + bw / 2;
        const cy = py + bh / 2;

        // Oval structure
        ctx.fillStyle = '#7d3c98';
        ctx.beginPath();
        ctx.ellipse(cx, cy, bw / 2 - m, bh / 2 - m, 0, 0, Math.PI * 2);
        ctx.fill();

        // Inner field (green)
        ctx.fillStyle = '#27ae60';
        ctx.beginPath();
        ctx.ellipse(cx, cy, bw / 2 - m - 8, bh / 2 - m - 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Field lines
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, bw * 0.15, bh * 0.15, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx, py + m + 8);
        ctx.lineTo(cx, py + bh - m - 8);
        ctx.stroke();

        // Stands (seating)
        ctx.fillStyle = '#bb8fce';
        ctx.beginPath();
        ctx.ellipse(cx, cy, bw / 2 - m, bh / 2 - m, 0, 0, Math.PI * 2);
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#9b59b6';
        ctx.stroke();

        // Floodlights
        ctx.fillStyle = '#f9e79f';
        const lightPositions = [
            [px + m + 4, py + m + 4],
            [px + bw - m - 4, py + m + 4],
            [px + m + 4, py + bh - m - 4],
            [px + bw - m - 4, py + bh - m - 4],
        ];
        for (const [lx, ly] of lightPositions) {
            ctx.beginPath();
            ctx.arc(lx, ly, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    _drawFountain(ctx, px, py, bw, bh, b) {
        const cx = px + bw / 2;
        const cy = py + bh / 2;

        // Basin
        ctx.fillStyle = '#95a5a6';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 4, bw * 0.35, bh * 0.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Water in basin
        ctx.fillStyle = '#5dade2';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 3, bw * 0.3, bh * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Center column
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(cx - 1.5, cy - 4, 3, 8);

        // Water spray
        ctx.fillStyle = 'rgba(133, 193, 233, 0.6)';
        const spray1 = Math.sin(this.animTime * 4) * 2;
        const spray2 = Math.cos(this.animTime * 3.5) * 2;
        ctx.beginPath();
        ctx.arc(cx + spray1, cy - 6, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - 1 + spray2, cy - 8, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx + 1, cy - 5 + spray1 * 0.5, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    _drawMonument(ctx, px, py, bw, bh, b) {
        const cx = px + bw / 2;
        const m = 3;

        // Base
        ctx.fillStyle = '#95a5a6';
        ctx.fillRect(cx - bw * 0.3, py + bh - m - 4, bw * 0.6, 4);

        // Pedestal
        ctx.fillStyle = '#bdc3c7';
        ctx.fillRect(cx - bw * 0.15, py + bh * 0.3, bw * 0.3, bh * 0.7 - m - 4);

        // Obelisk/spire
        ctx.fillStyle = '#d5d8dc';
        ctx.beginPath();
        ctx.moveTo(cx, py + m);
        ctx.lineTo(cx - bw * 0.1, py + bh * 0.35);
        ctx.lineTo(cx + bw * 0.1, py + bh * 0.35);
        ctx.closePath();
        ctx.fill();

        // Gold tip
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.moveTo(cx, py + m);
        ctx.lineTo(cx - 2, py + m + 4);
        ctx.lineTo(cx + 2, py + m + 4);
        ctx.closePath();
        ctx.fill();
    }

    _drawGenericBuilding(ctx, px, py, bw, bh, b) {
        const m = 3;
        ctx.fillStyle = b.def.color || '#aaa';
        ctx.fillRect(px + m, py + m, bw - m * 2, bh - m * 2);
        ctx.strokeStyle = Utils.darkenColor(b.def.color || '#aaa', 30);
        ctx.lineWidth = 1;
        ctx.strokeRect(px + m, py + m, bw - m * 2, bh - m * 2);

        // Label
        ctx.fillStyle = '#000';
        ctx.font = '8px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(b.def.icon || '?', px + bw / 2, py + bh / 2);
    }

    // ---- PLACEMENT PREVIEW ----
    _drawPlacementPreview(ctx, gameState) {
        if (!gameState || !gameState.selectedBuilding || gameState.hoveredTile == null) return;

        const def = BUILDINGS[gameState.selectedBuilding];
        if (!def) return;

        const [w, h] = def.size;
        const ts = CONFIG.TILE_SIZE;
        const tx = gameState.hoveredTile.x;
        const ty = gameState.hoveredTile.y;

        // Check if placement is valid
        const canPlace = this.map.canPlace(gameState.selectedBuilding, tx, ty);
        const color = canPlace ? CONFIG.COLORS.HIGHLIGHT_VALID : CONFIG.COLORS.HIGHLIGHT_INVALID;

        // Draw highlight
        ctx.fillStyle = color;
        ctx.fillRect(tx * ts, ty * ts, w * ts, h * ts);

        // Draw ghost building outline
        ctx.strokeStyle = canPlace ? '#2ecc71' : '#e74c3c';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(tx * ts, ty * ts, w * ts, h * ts);
        ctx.setLineDash([]);

        // If demolish mode
        if (gameState.demolishMode) {
            const building = this.map.getBuilding(tx, ty);
            if (building) {
                ctx.fillStyle = CONFIG.COLORS.DEMOLISH;
                ctx.fillRect(building.x * ts, building.y * ts, building.width * ts, building.height * ts);
                ctx.font = `${ts}px Arial`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🗑️', (building.x + building.width / 2) * ts,
                    (building.y + building.height / 2) * ts);
            }
        }
    }

    // ---- PARTICLE EFFECTS ----
    addParticle(worldX, worldY, type) {
        this.particles.push({
            x: worldX,
            y: worldY,
            vx: (Math.random() - 0.5) * 2,
            vy: -Math.random() * 3 - 1,
            life: 1.0,
            decay: 0.02 + Math.random() * 0.02,
            type: type,
            size: 2 + Math.random() * 3,
        });
    }

    _drawParticles(ctx) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;

            if (p.life <= 0) {
                this.particles.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = p.life;
            if (p.type === 'money') {
                ctx.fillStyle = '#2ecc71';
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('$', p.x, p.y);
            } else if (p.type === 'build') {
                ctx.fillStyle = '#f39c12';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'demolish') {
                ctx.fillStyle = '#e74c3c';
                ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size * p.life, p.size * p.life);
            }
            ctx.globalAlpha = 1.0;
        }
    }

    // ---- MINIMAP ----
    _drawMinimap(ctx) {
        const mmSize = 150;
        const mmPadding = 10;
        const mmX = this.canvas.width - mmSize - mmPadding;
        const mmY = this.canvas.height - mmSize - mmPadding;
        const tileW = mmSize / CONFIG.MAP_WIDTH;
        const tileH = mmSize / CONFIG.MAP_HEIGHT;

        // Background
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);

        // Draw terrain
        for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
            for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                const building = this.map.buildingGrid[y]?.[x];
                if (building) {
                    if (building.type === 'road') {
                        ctx.fillStyle = '#555';
                    } else if (building.def.category === 'residential') {
                        ctx.fillStyle = '#2ecc71';
                    } else if (building.def.category === 'commercial') {
                        ctx.fillStyle = '#3498db';
                    } else if (building.def.category === 'industrial') {
                        ctx.fillStyle = '#95a5a6';
                    } else {
                        ctx.fillStyle = '#f39c12';
                    }
                } else {
                    const terrain = this.map.terrainGrid[y]?.[x];
                    if (terrain === 'water') ctx.fillStyle = '#2980b9';
                    else if (terrain === 'sand') ctx.fillStyle = '#f4d03f';
                    else ctx.fillStyle = '#3d6e34';
                }
                ctx.fillRect(mmX + x * tileW, mmY + y * tileH, Math.ceil(tileW), Math.ceil(tileH));
            }
        }

        // Draw viewport rectangle
        const viewStartX = this.camera.x / (CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE) * mmSize;
        const viewStartY = this.camera.y / (CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE) * mmSize;
        const viewW = (this.canvas.width / this.camera.zoom) / (CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE) * mmSize;
        const viewH = (this.canvas.height / this.camera.zoom) / (CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE) * mmSize;

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(mmX + viewStartX, mmY + viewStartY, viewW, viewH);

        // Border
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
        ctx.strokeRect(mmX - 2, mmY - 2, mmSize + 4, mmSize + 4);
    }

    // Handle resize
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.terrainDirty = true;
    }
}
