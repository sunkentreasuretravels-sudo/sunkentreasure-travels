# Sunken Treasure Travels® — Launch Build

## Purpose
This build intentionally launches the website without the unfinished interactive map.

The map has a dedicated live-site placeholder: "Interactive World Map — Coming Soon."

## Locked architecture
The map is not allowed to replace the rest of the website again.

Customer media is separated into a standalone media envelope:
- media/inbox
- media/processing
- media/approved
- media/rejected

Content is separated from page presentation:
- data/
- content/countries/
- content/destinations/
- content/experiences/
- content/customer-stories/

This means new photos, videos, stories and destination records can be added without rewriting the homepage.

## Important
The customer upload interface in this static build is the front-end shell. Actual production file storage, automated safety scanning and human approval require a backend/storage service. The publication workflow is deliberately designed so raw customer uploads do not become public automatically.

## Current live-site direction
- Strong navy/ocean foundation
- Orange action accent
- Cyan secondary accent
- No unfinished globe
- Services and travel programs
- Consultation entry points
- Customer story/share area
- Dedicated map placeholder
