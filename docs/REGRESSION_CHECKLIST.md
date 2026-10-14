# Regression Testing Checklist
# Little Legends: Endless World — V2 Upgrade

## 1. Core Mechanics & Stability
- [x] Baseline 24 Vitest unit tests pass.
- [ ] Kael 4-directional movement operates smoothly with zero collision wall clipping.
- [ ] Stamina and Mana regeneration formulas work as intended.
- [ ] Dodge roll provides temporary invulnerability without causing stuck states.
- [ ] Camera smoothly tracks Kael with deadzone clamping.

## 2. UI / UX & Button Interactions
- [ ] Every visible button provides hover, active, and click sounds.
- [ ] Modal opening halts movement to avoid unintentional input leakage.
- [ ] In-game HUD displays animated vitals, active quest tracker, minimap, and hotbar.
- [ ] Inventory equipment comparison tooltip displays stat differences accurately.
- [ ] Skill tree unlocks allocate skill points and update hotbar slots.

## 3. Persistence & Sandbox Isolation
- [ ] Adventure mode save files load without loss of inventory, level, or quest state.
- [ ] Sandbox mode (`F2`) activates developer cheats (God mode, gold/item/level spawning).
- [ ] Sandbox state remains strictly quarantined in its own storage namespace.
- [ ] Achievements are disabled while Sandbox mode is active.

## 4. Visual Rendering & VFX Asset Pack
- [ ] Kael authentic pixel art sprite sheet and portrait render with crisp nearest-neighbor sampling.
- [ ] Dynamic point lights illuminate Kael's pendant, torches, and spell casts.
- [ ] Day/Night lighting transitions smoothly without frame drops.
- [ ] All 36 skills trigger appropriate sprite VFX, particle trails, and sound effects.
- [ ] Visual quality toggle (Low/Medium/High/Ultra) adjusts particle counts and lighting.
