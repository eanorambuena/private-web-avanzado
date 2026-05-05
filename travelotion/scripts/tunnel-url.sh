#!/bin/bash
# Usage: npm run tunnel:url
npx cloudflared tunnel --url http://localhost:3000 2>&1 | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com'