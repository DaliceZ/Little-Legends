# Save File Format & Schema Migrations
# Little Legends: Endless World

## 1. Storage Architecture

The game utilizes **Dexie.js (IndexedDB)** for robust, asynchronous browser storage.
It defines multiple tables:
- `saves`: Character profile, stats, level, gold, location, and equipment.
- `inventory`: Items owned by the player with unique instance IDs.
- `quests`: Quest status, objectives fulfilled, and reward claim flags.
- `skills`: Unlocked skills, skill points allocated, specialization choices.
- `achievements`: Completed milestones and unlocked trophies.
- `settings`: Audio volume, keybindings, screen shake, and language (English/Thai).

---

## 2. JSON Schema for Export / Import

Exported files are validated against the following schema before parsing:

```json
{
  "version": 1,
  "exportedAt": "2026-10-14T09:00:00.000Z",
  "saveSlot": 1,
  "player": {
    "name": "Kael",
    "level": 3,
    "exp": 450,
    "gold": 120,
    "echoShards": 5,
    "currentHp": 100,
    "maxHp": 120,
    "currentMp": 50,
    "maxMp": 50,
    "currentSp": 80,
    "maxSp": 80,
    "specialization": "blade_dancer",
    "equippedWeaponId": "item_worn_sword",
    "equippedArmorId": "item_wanderer_jacket",
    "equippedAccessoryId": "item_echo_pendant",
    "currentRegion": "everlight_village",
    "position": { "x": 480, "y": 320 }
  },
  "inventory": [],
  "quests": [],
  "skills": [],
  "achievements": [],
  "settings": {
    "language": "en",
    "masterVolume": 0.8,
    "sfxVolume": 0.9,
    "musicVolume": 0.7,
    "screenShake": true
  }
}
```

## 3. Data Integrity & Safety

- **Validation**: Incoming imported files are sanitized. Numerical values are clamped (e.g. `HP <= MaxHP`, `Level >= 1`).
- **Atomic Writes**: Saves execute in transactional batches to prevent corruption if the tab closes mid-write.
- **Corrupted Save Recovery**: If a save slot fails integrity checks, a fallback safe-state is loaded with an in-game warning notification.
