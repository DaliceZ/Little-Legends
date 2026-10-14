# Little Legends: Endless World — V3 Bug Audit & System Architecture

## Overview
This document records the diagnostics, root causes, severity ratings, proposed architectural fixes, and verification plans for the V3 Critical Fixes, Dragon Warrior Character Repair, and Pet System update.

---

### Audit Item 1: Dragon Warrior Transparent / Invisible Body Parts
- **Severity**: Critical (P0 - Visual & Immersion)
- **Affected Files**: `src/game/rendering/KaelSpriteLoader.ts`
- **Description**: The player character's horns, hair, steel pauldrons, leather tunic, and boots appear transparent or have missing chunks.
- **Root Cause**: Global naive color-keying compares every pixel against the sampled background color `(42, 43, 48)` using Euclidean distance with threshold 40. The Dragon Warrior character's dark armor, obsidian horns, and dark boots naturally share RGB values close to `(38-50, 40-52, 42-55)`. As a result, internal character pixels were incorrectly zeroed out (`alpha = 0`).
- **Proposed Fix**: Implement an exterior Flood-Fill (BFS) background removal algorithm from the sprite boundaries inwards. This ensures only contiguous external background pixels are made transparent, leaving 100% of the character's internal body, armor, horns, cape, and weapons intact.
- **Verification Plan**: Render sprite on bright test canvas; verify 0 internal holes in horns, armor, cape, or boots across all 4 directions.

---

### Audit Item 2: Skill Activation State Machine & Input Conflicts
- **Severity**: High (P0 - Gameplay Core)
- **Affected Files**: `src/game/scenes/WorldScene.ts`, `src/game/scenes/DungeonScene.ts`, `src/app/hud/GameHUD.tsx`
- **Description**: Skills could trigger simultaneously, interrupt mid-cast without recovery, deduct mana without casting if interrupted, or allow key-repeats on holding down keys. F2 console toggle could inadvertently pass through keys.
- **Root Cause**: Lack of a formal typed skill state machine (`IDLE`, `CAST_START`, `CASTING`, `IMPACT`, `RECOVERY`, `CANCELLED`). Skill execution previously ran as an immediate one-shot function without checking `isCasting` or locking movement during cast wind-up.
- **Proposed Fix**: Build a centralized `SkillCastingEngine` / state machine that validates:
  1. Input event (debounce, check not typing in input)
  2. Player state (not dead, not stunned, not in recovery)
  3. Skill assignment & cost validation
  4. Cooldown validation
  5. Wind-up / Anticipation animation
  6. Impact & VFX dispatch
  7. Recovery phase back to IDLE
- **Verification Plan**: Automated test suite for all 36 skills verifying cooldowns, interrupts, resource checks, and casting state transitions.

---

### Audit Item 3: Generic Placeholder Skill Icons
- **Severity**: Medium (P1 - UX Clarity)
- **Affected Files**: `src/app/hud/GameHUD.tsx`, `src/app/modals/SkillTreeModal.tsx`, `src/features/skills/skillData.ts`
- **Description**: All 36 skills shared generic tree emojis (🌀, 🛡️, 🔥, ❄️, 🗡️, 🔮), making it hard to identify skills on the hotbar.
- **Root Cause**: Icons relied only on tree-level fallback symbols rather than individual skill-level graphic assets.
- **Proposed Fix**: Build an SVG/Canvas Icon Generator (`SkillIconManager`) rendering 36 unique high-definition pixel-styled skill icons with elemental silhouettes (fireballs, meteor swarms, spinning whirlwind blades, frost novas, shadow daggers, and celestial crystal resonance).
- **Verification Plan**: Inspect all 36 hotbar and skill-tree nodes; verify unique silhouette, elemental colors, and 48x48 pixel readability.

---

### Audit Item 4: F2 Sandbox Developer Console Incompleteness
- **Severity**: High (P1 - QA Tooling & Sandbox)
- **Affected Files**: `src/app/modals/SandboxPanel.tsx`, `src/features/sandbox/sandboxManager.ts`
- **Description**: Sandbox console lacked pet controls (spawn eggs, hatch instantly, unlock species, toggle invulnerability), lacked search filtering across items, and needed strict save isolation from Adventure Mode.
- **Root Cause**: Sandbox features were implemented incrementally without a centralized command registry.
- **Proposed Fix**: Refactor `sandboxManager.ts` to include a full command dispatcher with Player, Currency, Inventory, Skills, World, Combat, and Pet modules. Ensure Sandbox state uses `isSandbox = true` to isolate saves.
- **Verification Plan**: Verify all console commands through automated unit tests in `tests/sandbox.test.ts`.

---

### Audit Item 5: Lack of Dynamic Quest Navigation & Waypoint Guidance
- **Severity**: Medium (P1 - Player Experience)
- **Affected Files**: `src/app/hud/GameHUD.tsx`, `src/game/scenes/WorldScene.ts`, `src/features/quests/questRegistry.ts`
- **Description**: Players wandering Everlight Village or Whispering Forest were uncertain where objectives were located.
- **Root Cause**: Quest system only tracked counters (e.g. 0/5 slimes) without destination coordinates or guidance hints.
- **Proposed Fix**: Add destination metadata and navigation targets (`targetLocation`, `suggestedAction`, `worldCoordinates`) to quest definitions. Render a dynamic floating quest waypoint / compass arrow pointing to the active objective.
- **Verification Plan**: Test quest state updates and waypoint pointer angle calculation.

---

### Audit Item 6: Missing Pet Companion & Egg Hatching System
- **Severity**: High (P2 - Major Feature)
- **Affected Files**: `src/features/pets/*`, `src/app/modals/PetModal.tsx`, `src/app/modals/HatcheryModal.tsx`, `src/game/scenes/*`
- **Description**: Pet system mentioned in design was not yet implemented.
- **Proposed Fix**:
  1. Define 8 pet species (`Forest Slime`, `Ember Fox`, `Frost Bunny`, `Thunder Cub`, `Shadow Cat`, `Crystal Sprite`, `Moss Turtle`, `Baby Dragon`) with unique abilities and stats.
  2. Add Pet Egg items with rarity drop tables (Monsters, Chests, Bosses).
  3. Create Village Hatchery interface with egg hatching animations.
  4. Implement smooth following pet AI with combat assistance (healing, attacking, status effects).
  5. Add Pet Management screen and Dexie save migration.
- **Verification Plan**: End-to-end automated pet journey test (`tests/petSystem.test.ts`).
