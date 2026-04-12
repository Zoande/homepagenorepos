# MegaCity Builder

A browser-based city-building simulation game built with vanilla JavaScript and HTML5 Canvas.

## Features

- **Procedural Terrain Generation** – Simplex noise-powered map with water, grass, sand, and trees
- **Building System** – Place residential, commercial, industrial, and civic buildings
- **Camera Controls** – Smooth pan, zoom, and edge-scrolling
- **Economy Simulation** – Tax rates, budgets, and population growth
- **Service Coverage** – Safety, fire, health, education, and happiness overlays
- **Day/Night Cycle** – Dynamic sky and lighting changes

## Project Structure

```
CityBuilder/
├── css/              # Stylesheets
├── js/
│   ├── camera.js     # Viewport, pan & zoom
│   ├── config.js     # Game configuration & building definitions
│   ├── map.js        # Terrain generation & tile grid
│   └── utils.js      # Utility functions (Simplex noise, helpers)
├── index.html        # Main entry point (coming soon)
└── README.md
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/DH4410/CityBuilder.git
   ```
2. Open `index.html` in your browser.

## Controls

| Action | Input                    |
| ------ | ------------------------ |
| Pan    | Arrow keys / WASD / drag |
| Zoom   | Scroll wheel             |
| Place  | Left click               |
| Cancel | Right click / Escape     |

## License

MIT
