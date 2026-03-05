# Stiletto Bot

A stylish multi-device WhatsApp bot built on Baileys with better menu layout, clickable buttons, moderation tools, and useful daily commands.

## Highlights
- Better WhatsApp-first layout (image menu card + quick reply buttons)
- Command panel using list categories for clean navigation
- Improved command coverage (utility, group admin, owner)
- Anti-link moderation with warning → auto-kick behavior
- AI assistant support via `!ai`

## Core Features
- **Main menu card**: `!menu`, `!help`, `!start`
- **Command panel**: `!categories`
- **AI**: `!ai <question>`
- **Interactive content**: `!poll`, `!catalog`, `!shop`, `!location`, `!feedback`
- **Utility**: `!ping`, `!stats`, `!uptime`, `!time`, `!quote`, `!owner`
- **Group admin**: `!rules`, `!tagall`, `!hidetag <message>`
- **Owner-only**: `!broadcast <message>`

## Setup
```bash
npm install
npm start
```

Scan QR in terminal and keep the process running.

## Optional Environment Variables
- `OWNER_NUMBER=2547...`
- `OWNER_NAME=Stiletto`
- `BOT_NAME=Stiletto Bot`
- `BOT_PREFIX=!`
- `WEBSITE_URL=https://your-site.com`
- `LOG_LEVEL=silent`

## Notes
- Session is stored in `stiletto-session/`.
- If command text does not trigger a command, open menu with `!menu`.

## License
MIT
