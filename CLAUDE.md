# Museum of Toronto: Interactive Story Map Kiosk

## What This Is
Prototype interactive kiosk for "The T.O. You Don't Know" exhibition at Museum of Toronto (401 Richmond). Web app running in Chrome kiosk mode on a 43-55" touchscreen.

## Client
Museum of Toronto (MoT). Contact: Davin Henson (Drew's brother), Director of Digital Programs.
Exhibition opens early June 2026.

## Stack
- Vite + React + TypeScript
- React Three Fiber (3D map)
- MediaPipe Hands (gesture tracking)
- Tailwind CSS v4 + Framer Motion
- Static JSON data (no backend)

## Key Files
- `public/data/stories.json` - Story metadata (10 stories with real Toronto data)
- `public/data/toronto-neighborhoods.json` - GeoJSON neighborhood boundaries
- `src/components/map/TorontoMap.tsx` - Main 3D scene
- `src/components/map/MapPin.tsx` - Story markers
- `src/App.tsx` - App state and view routing

## Running
```bash
npm run dev
```

## Video Files
Videos go in `public/videos/`. Currently placeholder. Drew is downloading and compressing ~40 videos from Air.inc (~400MB each, compressing to ~30-50MB at 720p with ffmpeg).
