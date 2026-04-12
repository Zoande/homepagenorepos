// ============================================================
// MegaCity Builder - Camera (Viewport & Pan/Zoom)
// ============================================================

class Camera {
    constructor(canvas) {
        this.canvas = canvas;
        this.x = 0;             // World position (top-left of viewport)
        this.y = 0;
        this.zoom = 1.0;
        this.targetZoom = 1.0;
        this.targetX = 0;
        this.targetY = 0;
        this.smoothing = 0.15;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;
        this.dragCamStartX = 0;
        this.dragCamStartY = 0;

        this.mapWidth = CONFIG.MAP_WIDTH * CONFIG.TILE_SIZE;
        this.mapHeight = CONFIG.MAP_HEIGHT * CONFIG.TILE_SIZE;
    }

    // Center camera on a world position
    centerOn(worldX, worldY) {
        this.targetX = worldX - (this.canvas.width / this.zoom) / 2;
        this.targetY = worldY - (this.canvas.height / this.zoom) / 2;
        this.x = this.targetX;
        this.y = this.targetY;
        this._clamp();
    }

    // Center on the map center
    centerOnMap() {
        this.centerOn(this.mapWidth / 2, this.mapHeight / 2);
    }

    // Pan by screen pixels
    pan(dx, dy) {
        this.targetX -= dx / this.zoom;
        this.targetY -= dy / this.zoom;
        this._clamp();
    }

    // Zoom towards a screen point
    zoomAt(screenX, screenY, delta) {
        const oldZoom = this.targetZoom;
        this.targetZoom = Utils.clamp(
            this.targetZoom + delta * CONFIG.CAMERA.ZOOM_SPEED,
            CONFIG.CAMERA.MIN_ZOOM,
            CONFIG.CAMERA.MAX_ZOOM
        );

        // Zoom towards mouse position
        const worldX = this.screenToWorldX(screenX);
        const worldY = this.screenToWorldY(screenY);

        // After zoom, adjust position so point under mouse stays
        const zoomRatio = this.targetZoom / oldZoom;
        this.targetX = worldX - (worldX - this.targetX) / zoomRatio;
        this.targetY = worldY - (worldY - this.targetY) / zoomRatio;
    }

    // Convert screen coords to world coords
    screenToWorldX(screenX) {
        return screenX / this.zoom + this.x;
    }

    screenToWorldY(screenY) {
        return screenY / this.zoom + this.y;
    }

    // Convert screen to tile coords
    screenToTile(screenX, screenY) {
        const worldX = this.screenToWorldX(screenX);
        const worldY = this.screenToWorldY(screenY);
        return {
            x: Math.floor(worldX / CONFIG.TILE_SIZE),
            y: Math.floor(worldY / CONFIG.TILE_SIZE),
        };
    }

    // Convert world to screen coords
    worldToScreenX(worldX) {
        return (worldX - this.x) * this.zoom;
    }

    worldToScreenY(worldY) {
        return (worldY - this.y) * this.zoom;
    }

    // Get visible tile range for culling
    getVisibleTiles() {
        const tileSize = CONFIG.TILE_SIZE;
        const startX = Math.max(0, Math.floor(this.x / tileSize) - 1);
        const startY = Math.max(0, Math.floor(this.y / tileSize) - 1);
        const endX = Math.min(CONFIG.MAP_WIDTH - 1,
            Math.ceil((this.x + this.canvas.width / this.zoom) / tileSize) + 1);
        const endY = Math.min(CONFIG.MAP_HEIGHT - 1,
            Math.ceil((this.y + this.canvas.height / this.zoom) / tileSize) + 1);
        return { startX, startY, endX, endY };
    }

    // Smooth update
    update(dt) {
        // Smooth zoom
        this.zoom += (this.targetZoom - this.zoom) * this.smoothing;
        if (Math.abs(this.targetZoom - this.zoom) < 0.001) {
            this.zoom = this.targetZoom;
        }

        // Smooth pan
        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;
        if (Math.abs(this.targetX - this.x) < 0.1) this.x = this.targetX;
        if (Math.abs(this.targetY - this.y) < 0.1) this.y = this.targetY;
    }

    // Edge panning (mouse near screen edges)
    edgePan(mouseX, mouseY) {
        const zone = CONFIG.CAMERA.EDGE_PAN_ZONE;
        const speed = CONFIG.CAMERA.EDGE_PAN_SPEED / this.zoom;

        if (mouseX < zone) this.targetX -= speed * (1 - mouseX / zone);
        if (mouseX > this.canvas.width - zone) this.targetX += speed * (1 - (this.canvas.width - mouseX) / zone);
        if (mouseY < zone) this.targetY -= speed * (1 - mouseY / zone);
        if (mouseY > this.canvas.height - zone) this.targetY += speed * (1 - (this.canvas.height - mouseY) / zone);

        this._clamp();
    }

    // Start drag
    startDrag(screenX, screenY) {
        this.isDragging = true;
        this.dragStartX = screenX;
        this.dragStartY = screenY;
        this.dragCamStartX = this.targetX;
        this.dragCamStartY = this.targetY;
    }

    // Update drag
    updateDrag(screenX, screenY) {
        if (!this.isDragging) return;
        const dx = (screenX - this.dragStartX) / this.zoom;
        const dy = (screenY - this.dragStartY) / this.zoom;
        this.targetX = this.dragCamStartX - dx;
        this.targetY = this.dragCamStartY - dy;
        this._clamp();
    }

    // End drag
    endDrag() {
        this.isDragging = false;
    }

    _clamp() {
        const viewW = this.canvas.width / this.zoom;
        const viewH = this.canvas.height / this.zoom;
        const pad = CONFIG.TILE_SIZE * 3;
        this.targetX = Utils.clamp(this.targetX, -pad, this.mapWidth - viewW + pad);
        this.targetY = Utils.clamp(this.targetY, -pad, this.mapHeight - viewH + pad);
    }

    // Apply camera transform to canvas context
    applyTransform(ctx) {
        ctx.setTransform(this.zoom, 0, 0, this.zoom, -this.x * this.zoom, -this.y * this.zoom);
    }

    resetTransform(ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}
