#!/bin/bash
npx cloudflared tunnel --url http://localhost:5173 2>&1 | grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com'