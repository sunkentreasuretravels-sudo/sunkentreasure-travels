# Deployment Guide

This is a static site intended for Cloudflare Pages.

The production entry point is `/index.html` at the repository root.

No Node build command is required for the current version. Publish the repository root as the Cloudflare Pages output directory.

The interactive map loads its world geometry from the pinned World Atlas CDN and its map library from pinned jsDelivr modules.
