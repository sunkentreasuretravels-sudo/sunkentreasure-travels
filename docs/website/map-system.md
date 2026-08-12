# Interactive World Map

The map is a feature, not the site's architecture.

## Current behavior
- World basemap rendered with D3 + World Atlas.
- Destination points are loaded from `data/destinations/destinations.json`.
- Event points are loaded from `data/destinations/events.json`.
- Hover/focus/click opens a preview.
- Preview can link to an internal destination/experience page.
- Map supports zoom and drag.
- Optional ambient audio can be enabled by adding a licensed `assets/audio/ambient-travel.mp3`.

## Future automation
The event JSON is intentionally data-driven. A future discovery/approval workflow can propose events without changing the map code. Approved events are written into `events.json`.
