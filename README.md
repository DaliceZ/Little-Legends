# Little Legends: Endless World (ตำนานผู้พิทักษ์: โลกไร้สิ้นสุด)

A 2D top-down cozy fantasy Action RPG, Roguelite Dungeon Crawler, and Village Simulation built with React, TypeScript, Phaser 3, Tailwind CSS, and Dexie.js (IndexedDB).

## Features

- **Responsive Action Combat**: Real-time sword slashing, dodge rolling with invulnerability frames, stamina management, hit feedback, knockback, and telegraphed enemy attacks.
- **Everlight Village Hub**: Cozy persistent settlement featuring the Village Healer (Mira), Blacksmith (Rowan), Guild Master (Elara), General Merchant (Finn), and Story Guide (Elder Orin).
- **Procedural Dungeon Generator**: Seeded, reproducible dungeon rooms with connectivity validation, combat challenges, treasure caches, and the Ancient Golem boss chamber.
- **Three Skill Specializations**:
  - *Blade Dancer*: Swift attacks, critical strikes, and dash mastery.
  - *Guardian*: Heavy defenses, counterattacks, and damage mitigation.
  - *Echo Mage*: Crystal energy, ranged arcane projectiles, and mana-fueled bursts.
- **Deep Item & Equipment System**: Weapon and armor rarities (Common to Legendary), randomized affixes, stacking inventory, equipment stat comparison, and crafting upgrades.
- **Bilingual Support**: Full Thai (ภาษาไทย) and English toggle with persistent setting.
- **Local-First & Offline Ready**: Instant IndexedDB persistence with Dexie.js, manual saves, checkpoints, save export/import, and zero cloud lock-in.

---

## Prerequisites

- **Node.js**: `v20.x` or `v22.x` recommended (Node 18+ supported)
- **NPM**: `v9.x` or `v10.x`

---

## Getting Started

### 1. Installation

```bash
npm install
```

### 2. Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` to play the game in development mode with HMR.

### 3. Running Tests

```bash
# Unit & Integration tests
npm run test

# Type checking
npm run typecheck
```

### 4. Production Build

```bash
npm run build
npm run preview
```

---

## Controls

| Action | Primary Key | Secondary / Mouse |
| :--- | :--- | :--- |
| **Move Up / Left / Down / Right** | `W` / `A` / `S` / `D` | Arrow Keys |
| **Sprint** | `Shift` | - |
| **Dodge Roll** | `Space` | - |
| **Attack** | `J` | Left Click |
| **Interact / Talk / Enter** | `E` | - |
| **Active Skill** | `K` / `1` | Right Click |
| **Inventory** | `I` | - |
| **Equipment & Character** | `C` | - |
| **Quest Journal** | `Q` | - |
| **World Map** | `M` | - |
| **Pause Menu / Back** | `Escape` | - |

---

## Documentation

- [Game Design Document (GDD)](docs/GDD.md)
- [Software Architecture](docs/ARCHITECTURE.md)
- [Development Roadmap](docs/ROADMAP.md)
- [Pixel Art & Asset Specification](docs/ASSET_GUIDE.md)
- [Save Data & Schema Migrations](docs/SAVE_FORMAT.md)
- [Testing Strategy](docs/TESTING.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Changelog](docs/CHANGELOG.md)

---

## License

MIT License. Designed and developed with care.
