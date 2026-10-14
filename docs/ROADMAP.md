# Development Roadmap & Phase Tracking
# Little Legends: Endless World

## Phase 0: Planning & Architecture [COMPLETED]
- [x] Initialized architecture specification and GDD.
- [x] Defined TypeScript data contracts and Dexie persistence schema.
- [x] Established project directory structure.

## Phase 1: Playable Foundation [ACTIVE]
- [ ] React 18 + Vite + Phaser 3 integration with zero memory leaks.
- [ ] Crisp pixel graphics generator for 32x32 tilesets and character sprites.
- [ ] Kael 4-directional movement (Idle, Walk, Sprint, Dodge) with Arcade physics.
- [ ] Smooth camera tracking with deadzone and boundary clamping.
- [ ] Interactive Everlight Village map with solid collision geometry.
- [ ] Basic React HUD displaying HP, MP, SP, and Level.

## Phase 2: Combat Vertical Slice
- [ ] Directional melee combo attack system with hitbox detection.
- [ ] Stamina-based dodge roll with invulnerability window.
- [ ] Enemy AI State Machine (Idle, Patrol, Detect, Chase, Attack, Hurt, Dead).
- [ ] First enemies: Green Slime and Forest Bat with unique behaviors.
- [ ] Floating damage numbers, screen shake, and hitstop/knockback impact.
- [ ] Loot drop system with pickup magnetism.

## Phase 3: Core RPG Loop
- [ ] Everlight Village interactive NPCs (Mira, Rowan, Elara, Finn, Elder Orin).
- [ ] Branching dialogue engine with Thai and English localization.
- [ ] Quest Engine: Quest journal, objectives, completion triggers, reward claim.
- [ ] Inventory and equipment system with stat recalculation.
- [ ] Merchant economy: Buying potions, selling monster drops.
- [ ] Local persistence: IndexedDB auto-save and manual save slots.

## Phase 4: Procedural Dungeon System
- [ ] Seeded dungeon generation using room graph & corridor carving.
- [ ] Guaranteed connectivity verification (BFS/FloodFill).
- [ ] Entrance, Exit, Combat rooms, Treasure chests, and Boss chamber.
- [ ] Mushroom Guardian and Ancient Golem boss encounter with telegraphed attacks.
- [ ] Dungeon extraction and death recovery logic.

## Phase 5: Progression & Replayability
- [ ] Three Skill Trees: Blade Dancer, Guardian, Echo Mage.
- [ ] Equipment rarity system (Common to Legendary) with random affixes.
- [ ] Blacksmith equipment crafting and enhancement upgrades.
- [ ] Achievements system with tracking and rewards.
- [ ] Endless Echo Tiered dungeon modifier system.

## Phase 6: Polish, Audio & Localization
- [ ] Procedural sound synthesizer (combat slashes, impacts, item pickups, ambient music).
- [ ] Settings modal: Keybindings, volume sliders, screen shake toggle, Thai/EN language toggle.
- [ ] Game Over, victory, and credits screens.

## Phase 7: Verification & Production Readiness
- [ ] Automated Vitest suite for formulas, inventory, quests, and dungeon generation.
- [ ] Clean TypeScript type checking without errors.
- [ ] Production build verification with Vite.
