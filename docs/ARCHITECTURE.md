# Software Architecture Specification
# Little Legends: Endless World

## 1. Architectural Philosophy

The architecture strictly decouples **simulation/business rules** from **presentation/rendering**.

- **Game Simulation & Domain Core (`src/game/domain`, `src/features`)**:
  - Pure TypeScript logic with zero DOM or Phaser dependencies.
  - Houses stats calculation, item generation, inventory validation, quest tracking, and dungeon generation algorithms.
  - 100% unit-testable in Node/jsdom without initializing a canvas or WebGL context.

- **Game Rendering Engine (`src/game/scenes`, `src/game/rendering`)**:
  - Phaser 3 manages high-performance 60 FPS sprite rendering, animations, camera viewports, Arcade physics collision boundaries, and particle systems.
  - Listens to domain events and emits input/interaction events.

- **UI & State Layer (`src/app`, `src/features`)**:
  - React 18 manages interactive menus, HUD overlays, dialogue windows, inventory grids, skill trees, and modal dialogs.
  - Zustand manages reactive UI state and synchronization with Phaser scenes through an event-driven `EventBus`.

- **Persistence Layer (`src/persistence`)**:
  - Dexie.js (IndexedDB) for robust offline storage, transactional saves, migrations, and import/export.

```
+-------------------------------------------------------------------+
|                        React UI Layer                             |
|  (HUD, Inventory Modal, Dialogues, Skill Trees, Settings, Shop)   |
+---------------------------------+---------------------------------+
                                  |
                        Zustand Store / EventBus
                                  |
+---------------------------------v---------------------------------+
|                       Phaser 3 Engine                             |
|    (BootScene, PreloadScene, VillageScene, DungeonScene, World)    |
|    Arcade Physics, Tilemaps, Sprite Animations, Hitbox Telegrap)   |
+---------------------------------+---------------------------------+
                                  |
                         Domain Simulation
  (DungeonGen, CombatCalculations, LootTables, QuestEngine, Stats)
                                  |
+---------------------------------v---------------------------------+
|                   Persistence (Dexie / IndexedDB)                 |
+-------------------------------------------------------------------+
```

## 2. Directory Structure

```
src/
  app/                    # React UI components, HUD, modals, screens, providers
    components/           # Reusable UI widgets (Modals, Tooltips, Buttons, Cards)
    hud/                  # Health/Mana/Stamina bars, mini-map, quickbar, objective tracker
    modals/               # InventoryModal, CharacterModal, QuestJournal, ShopModal, etc.
    store/                # Zustand UI & game state stores
  game/                   # Phaser 3 Game Engine code
    config/               # Phaser GameConfig, controls constants, layers
    scenes/               # BootScene, WorldScene, DungeonScene, GameOverScene
    entities/             # Player, Enemy, NPC, Boss, Projectile, Drop
    combat/               # Hitboxes, telegraph indicators, knockback, damage floating text
    dungeon/              # BSP/Room generator, connectivity validator, seed PRNG
    rendering/            # Pixel art procedural texture generator & sprite builders
    events/               # Typed EventBus bridging Phaser and React
  features/               # Modular game domain logic
    combat/               # Pure combat formulas, damage mitigation, crit calculators
    inventory/            # Inventory container, stacking, equipment slot constraints
    items/                # Item definitions, affix rolling, rarity calculations
    quests/               # Quest state machine, objectives, reward validation
    skills/               # Skill trees (Blade Dancer, Guardian, Echo Mage)
    crafting/             # Recipe checking, upgrade formulas
    dialogue/             # Dialogue branching engine, conditional nodes
  persistence/            # IndexedDB via Dexie
    database.ts           # Dexie database declaration with schemas
    saveService.ts        # Checkpoint manager, export/import JSON validator
    migrations.ts         # Schema version migrations
  shared/                 # Common interfaces and utilities
    types/                # Shared TypeScript models (Entity, Stats, Item, Quest)
    utils/                # Seeded PRNG, math helpers, sound synthesizer
    localization/         # English & Thai translations dictionary
```

## 3. Communication Bridge (Phaser <-> React)

- The game canvas is mounted inside a React component (`GameCanvas.tsx`).
- Communication flows through a strongly-typed `EventBus`:
  - `PLAYER_STATS_CHANGED`: Updates React HUD without polling.
  - `OPEN_MODAL` / `CLOSE_MODAL`: Opens dialogue, inventory, or shop in React.
  - `INVENTORY_UPDATED`: Notifies React UI of item changes.
  - `ITEM_USED` / `EQUIPMENT_CHANGED`: Emitted from React back to Phaser to update stats/visuals.
  - `ZONE_TRANSITION`: Informs React of region changes and dungeon floors.
