# Map System — Finish Build v2

The map has three layers: geography, curated travel markers, and experience routing.

## Geography
Every country/territory in the world-atlas layer is hoverable, named, keyboard accessible and clickable.

## Curated markers
Destinations, hubs and approved events are curated highlights. They are not intended to imply geographic service limitations.

## Experience routing
Markers can carry `experienceIds`. The map loads `/data/experiences/experiences.json` and resolves those IDs to a dedicated experience route. A marker with an associated experience gets a primary action to that experience and a secondary action to the underlying destination/event.

## Zoom
Marker radii remain constant in screen space. Clustering is used at lower zoom levels and progressively relaxes as the user zooms in.
