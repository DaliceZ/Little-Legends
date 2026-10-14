# Deployment Guide
# Little Legends: Endless World

## 1. Static Production Build

The application compiles into a completely static, standalone client bundle suitable for any static hosting platform:
- Vercel
- Cloudflare Pages
- Netlify
- GitHub Pages

### Build Command
```bash
npm run build
```
This generates the optimized production bundle in the `dist/` directory.

### Preview Locally
```bash
npm run preview
```

## 2. Zero-Cloud Local-First Architecture
- All gameplay, combat, progression, quests, crafting, dialogue, and save data run directly in the browser via Web Workers, Canvas/WebGL, and IndexedDB.
- No external server or paid API is required for the full experience.
- PWA and ServiceWorker caching can be added for 100% offline gameplay.
