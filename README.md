# Stiletto Bot

A modular multi-device WhatsApp bot built with Baileys.

## ✅ New Architecture
This project now uses **libs + plugins** so it is easier to scale:

```txt
/libs
  ai.js
  config.js
  helpers.js
  moderation.js
  pluginLoader.js
/plugins
  ai.js
  features.js
  group.js
  menu.js
  owner.js
  utility.js
main.js
```

- **libs/** = reusable backend utilities (API handlers, helpers, moderation, plugin loader)
- **plugins/** = command features (menu, AI, group/admin, utility, owner, commerce)

## Features
- Better WhatsApp layout with image menu + quick buttons
- Command categories panel
- Anti-link moderation (warn then kick)
- Group tools (`tagall`, `hidetag`, `rules`)
- Utility commands (`ping`, `stats`, `time`, `quote`, `owner`)
- AI command (`!ai <question>`)
- Shop, catalog, poll and feedback flows

## Commands
- `!menu`, `!help`, `!start`, `!categories`
- `!ping`, `!stats`, `!uptime`, `!time`, `!quote`, `!owner`
- `!rules`, `!tagall`, `!hidetag <message>`
- `!poll`, `!catalog`, `!shop`, `!location`, `!feedback`
- `!ai <question>`
- `!broadcast <message>` (owner only)

## Setup
```bash
npm install
npm start
```

## Environment variables
- `OWNER_NUMBER=2547...`
- `OWNER_NAME=Stiletto`
- `BOT_NAME=Stiletto Bot`
- `BOT_PREFIX=!`
- `WEBSITE_URL=https://your-site.com`
- `LOG_LEVEL=silent`

## License
MIT
