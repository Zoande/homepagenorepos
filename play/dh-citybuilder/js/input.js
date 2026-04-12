// ============================================================
// MegaCity Builder - Input Handler
// ============================================================

class InputHandler {
    constructor(canvas, camera, game) {
        this.canvas = canvas;
        this.camera = camera;
        this.game = game;

        this.mouseX = 0;
        this.mouseY = 0;
        this.mouseWorldX = 0;
        this.mouseWorldY = 0;
        this.hoveredTile = { x: 0, y: 0 };
        this.isMouseDown = false;
        this.mouseButton = 0;
        this.isDragging = false;
        this.dragStartX = 0;
        this.dragStartY = 0;

        this.keysDown = new Set();

        this._bindEvents();
    }

    _bindEvents() {
        // Mouse events
        this.canvas.addEventListener('mousemove', (e) => this._onMouseMove(e));
        this.canvas.addEventListener('mousedown', (e) => this._onMouseDown(e));
        this.canvas.addEventListener('mouseup', (e) => this._onMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this._onWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        this.canvas.addEventListener('mouseleave', () => {
            this.isMouseDown = false;
            this.camera.endDrag();
        });

        // Keyboard events
        window.addEventListener('keydown', (e) => this._onKeyDown(e));
        window.addEventListener('keyup', (e) => this._onKeyUp(e));

        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this._onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this._onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this._onTouchEnd(e));
    }

    _onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouseX = e.clientX - rect.left;
        this.mouseY = e.clientY - rect.top;

        this.mouseWorldX = this.camera.screenToWorldX(this.mouseX);
        this.mouseWorldY = this.camera.screenToWorldY(this.mouseY);

        this.hoveredTile = this.camera.screenToTile(this.mouseX, this.mouseY);

        // If right-button dragging, update camera drag
        if (this.isMouseDown && this.mouseButton === 2) {
            this.camera.updateDrag(this.mouseX, this.mouseY);
        }

        // If left-button held and painting roads
        if (this.isMouseDown && this.mouseButton === 0) {
            const selectedBuilding = this.game.state.selectedBuilding;
            if (selectedBuilding === 'road') {
                this.game.tryPlaceBuilding(this.hoveredTile.x, this.hoveredTile.y);
            }
        }
    }

    _onMouseDown(e) {
        this.isMouseDown = true;
        this.mouseButton = e.button;
        this.dragStartX = this.mouseX;
        this.dragStartY = this.mouseY;

        if (e.button === 2) {
            // Right click - start camera drag
            this.camera.startDrag(this.mouseX, this.mouseY);
        } else if (e.button === 0) {
            // Left click
            if (this.game.state.demolishMode) {
                this.game.tryDemolish(this.hoveredTile.x, this.hoveredTile.y);
            } else if (this.game.state.selectedBuilding) {
                this.game.tryPlaceBuilding(this.hoveredTile.x, this.hoveredTile.y);
            } else {
                // Select/inspect building
                this.game.inspectTile(this.hoveredTile.x, this.hoveredTile.y);
            }
        } else if (e.button === 1) {
            // Middle click - start camera drag too
            this.camera.startDrag(this.mouseX, this.mouseY);
        }
    }

    _onMouseUp(e) {
        this.isMouseDown = false;
        if (e.button === 2 || e.button === 1) {
            this.camera.endDrag();
        }
    }

    _onWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -1 : 1;
        this.camera.zoomAt(this.mouseX, this.mouseY, delta);
    }

    _onKeyDown(e) {
        this.keysDown.add(e.key.toLowerCase());

        switch (e.key) {
            case 'Escape':
                this.game.cancelSelection();
                break;
            case 'Delete':
            case 'x':
                this.game.toggleDemolish();
                break;
            case '1': this.game.setSpeed(0); break;
            case '2': this.game.setSpeed(1); break;
            case '3': this.game.setSpeed(2); break;
            case '4': this.game.setSpeed(3); break;
            case '5': this.game.setSpeed(4); break;
            case ' ':
                e.preventDefault();
                this.game.togglePause();
                break;
            case 'r':
                this.game.selectBuilding('road');
                break;
            case 'g':
                this.game.ui.toggleGrid();
                break;
        }
    }

    _onKeyUp(e) {
        this.keysDown.delete(e.key.toLowerCase());
    }

    // Touch support
    _lastTouchDist = 0;

    _onTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.mouseX = touch.clientX - rect.left;
            this.mouseY = touch.clientY - rect.top;
            this.hoveredTile = this.camera.screenToTile(this.mouseX, this.mouseY);
            this.camera.startDrag(this.mouseX, this.mouseY);
            this.isDragging = true;
            this.dragStartX = this.mouseX;
            this.dragStartY = this.mouseY;
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            this._lastTouchDist = Math.sqrt(dx * dx + dy * dy);
        }
    }

    _onTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && this.isDragging) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const mx = touch.clientX - rect.left;
            const my = touch.clientY - rect.top;
            this.camera.updateDrag(mx, my);
        } else if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const delta = (dist - this._lastTouchDist) * 0.02;
            const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            this.camera.zoomAt(midX, midY, delta);
            this._lastTouchDist = dist;
        }
    }

    _onTouchEnd(e) {
        if (e.touches.length === 0) {
            if (this.isDragging) {
                // Check if it was a tap (not a drag)
                const dist = Math.sqrt(
                    (this.mouseX - this.dragStartX) ** 2 +
                    (this.mouseY - this.dragStartY) ** 2
                );
                if (dist < 10) {
                    // It's a tap - treat as click
                    if (this.game.state.demolishMode) {
                        this.game.tryDemolish(this.hoveredTile.x, this.hoveredTile.y);
                    } else if (this.game.state.selectedBuilding) {
                        this.game.tryPlaceBuilding(this.hoveredTile.x, this.hoveredTile.y);
                    }
                }
                this.camera.endDrag();
                this.isDragging = false;
            }
        }
    }

    // Call each frame for keyboard-based panning
    update() {
        const speed = CONFIG.CAMERA.PAN_SPEED / this.camera.zoom;
        if (this.keysDown.has('arrowup') || this.keysDown.has('w')) this.camera.pan(0, speed);
        if (this.keysDown.has('arrowdown') || this.keysDown.has('s')) this.camera.pan(0, -speed);
        if (this.keysDown.has('arrowleft') || this.keysDown.has('a')) this.camera.pan(speed, 0);
        if (this.keysDown.has('arrowright') || this.keysDown.has('d')) this.camera.pan(-speed, 0);
    }

    getState() {
        return {
            hoveredTile: { ...this.hoveredTile },
            mouseX: this.mouseX,
            mouseY: this.mouseY,
        };
    }
}
