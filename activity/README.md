# Nexix Connect — Activity prototype

This is a separate **website service**, not a second Discord bot. It uses Discord's Embedded App SDK to display Activity session participants. The native voice-channel message panel is **not yet integrated**; it explicitly shows that limitation rather than pretending to mirror messages.

## Railway (second service only)
- Source: `luminescence73/Nexira`, branch `feature/voice-chat`.
- **Root Directory:** `/activity`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Variable:** `VITE_DISCORD_CLIENT_ID` = Nexira's Discord Application ID (not the bot token).
- Generate a public Railway domain under Networking. It must use HTTPS.

## Discord Developer Portal
- Activities → URL Mappings → Root Mapping: prefix `/`, target = Railway domain (without a path; use the exact format Discord requests).
- Save, then enable Activities.
- Test by launching the Activity inside a voice channel.

## Next development phase
To display native VC messages alongside participants, implement an authenticated, permission-checked bot-to-website bridge. The Discord Activity SDK does not automatically expose native VC chat history, and this prototype does not claim to.
