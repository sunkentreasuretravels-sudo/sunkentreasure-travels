# Sunken Treasure Travels® Ltd — Cloudflare Ready

This package preserves the completed website and places all deployable website assets in `site/`.

Cloudflare Workers deploys only `./site`, keeping Git metadata outside the asset directory.

Deployment command: `npx wrangler deploy`
