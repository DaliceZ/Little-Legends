# Pixel Art & Asset Specification Guide
# Little Legends: Endless World

## 1. Visual Standards & Art Style

- **Art Direction**: 16-bit / 32-bit inspired cozy fantasy pixel art with a rich, warm dark fantasy palette.
- **Base Grid Size**: 32x32 pixels per tile.
- **Character Sprites**: 32x48 or 32x32 pixels, rendered with a slight 3/4 perspective.
- **Filtering**: Strict nearest-neighbor (`pixelArt: true` in Phaser 3, CSS `image-rendering: pixelated`). Never use bilinear smoothing or blurry downscaling.
- **Color Palette Philosophy**:
  - Highlights: Echo Crystal Cyan (`#38bdf8`, `#7dd3fc`), Auric Gold (`#f59e0b`, `#fbbf24`).
  - Warm Earth & Wood: Rich timbers (`#3b2f27`, `#5c483a`), mossy slate stone (`#2a323d`, `#404c5e`).
  - Dark Fantasy UI: Deep charcoal slate (`#0c0d14`, `#141622`, `#1e2235`).

---

## 2. Sprite Sheet & Animation Specifications

### Protagonist: Kael
- **Dimensions**: 32x40 pixels per frame.
- **Anchor / Origin**: Pivot at `(0.5, 0.85)` (feet level for proper depth sorting).
- **Collision Box**: Width 20px, Height 16px, Offset `(6, 24)` to accurately represent feet collision against obstacles.
- **Animations Required**:
  - `idle_down`, `idle_up`, `idle_left`, `idle_right` (4 frames, 4-6 fps)
  - `walk_down`, `walk_up`, `walk_left`, `walk_right` (6 frames, 8-10 fps)
  - `sprint_down`, `sprint_up`, `sprint_left`, `sprint_right` (6 frames, 12 fps)
  - `attack_down`, `attack_up`, `attack_left`, `attack_right` (3 frames, 14 fps)
  - `dodge_down`, `dodge_up`, `dodge_left`, `dodge_right` (4 frames, 14 fps)
  - `hurt` (2 frames, flashing white/red)
  - `death` (4 frames)

### Replacing Placeholder Graphics
The game incorporates a programmatic, deterministic pixel-art generation engine (`src/game/rendering/PixelTextureGenerator.ts`).
To replace these with user-authored `.png` sprite sheets:
1. Place your PNG file in `public/assets/sprites/`.
2. Register the asset in `src/game/scenes/PreloadScene.ts`.
3. The animations use standardized frame numbers and naming conventions, so game logic remains completely untouched when swapping art assets.
