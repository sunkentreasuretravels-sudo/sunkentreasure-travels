# Changelog

## v3 — Local World Map Engine
- Removed the external world-atlas dependency from the map.
- Bundled local country geometry and metadata.
- Added country hover/click behavior.
- Added fallback country hit targets for small/missing-geometry countries.
- Added regional master imagery so destinations no longer all use the same photo.
- Kept experience routing and destination/event architecture.
- Reworked zoom/pan to keep markers visually controlled.

# Changelog

## Map & Experience Engine — Finalization Build
- Reworked world map zoom so geography and markers behave independently.
- Added country-name hover tooltips and keyboard interaction.
- Added country click context.
- Added controlled marker sizing during zoom.
- Added dynamic clustering for dense regions.
- Added explicit zoom in/reset/zoom out controls.
- Added country data layer.
- Added experience registry.
- Added reusable experience page route.
- Added reusable exploration route for destinations and events.
- Added site navigation configuration.
- Updated destination/event links to functional exploration routes.
- Preserved the curated-marker philosophy: highlighted locations are not service limits.


## Finish Build v2 — Map + Experience Integration
- Wired map markers to the experience registry.
- Added experience-aware map preview actions.
- Added destination experience association for The Orange Pair in Antigua & Barbuda.
- Preserved country identification, clustering and controlled marker sizing.
- Added dual-action destination/event previews where an associated experience exists.
