# Sunken Treasure Travels Map System — v3

The map is dependency-free for world geography. Country geometry and country metadata are bundled locally so the map does not disappear when a third-party CDN is unavailable.

## Geography
- Local country geometry: `data/destinations/world-geo.json`
- Full country metadata: `data/destinations/countries-full.json`
- Sovereign-state geography is prioritized; additional country/territory records can be added without changing the rendering engine.

## Interaction
- Hover a country: identify it.
- Click a country: open country exploration.
- Hover/click a destination, hub or event: open the preview panel.
- Zoom/pan: geography moves; markers remain controlled in size.
- Dense markers cluster and separate as zoom increases.

## Imagery
Country previews use regional master imagery until dedicated country/destination imagery is available. The system is designed so individual images can later be added without changing the map architecture.
