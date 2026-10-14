# Advanced Visual Rendering & VFX Architecture Plan
# Little Legends: Endless World — V2 Upgrade

## 1. Visual Upgrade Objectives

1. **Incorporate Authentic Pixel Art Sprite Sheet**: Integrate the user-uploaded 1024x764 Kael character sprite sheet and portrait, replacing programmatic approximations with hand-crafted pixel art for idle, walk, 3-hit slash combos, dodge rolls, hurt reactions, and death.
2. **Dynamic 2D Lighting & Day/Night System**:
   - Ambient color grading across 4 cycles: Dawn, Day, Dusk, Night.
   - Dynamic point lights on Kael's glowing blue crystal pendant, fire torches, the village forge, glowing crystals, and spell projectiles.
3. **Multi-Layered Shadow System**:
   - Ground contact elliptical soft shadows for player, NPCs, and monsters.
   - Directional cast shadows according to day/night sun angle.
4. **Atmospheric Particle Engines**:
   - Everlight Village: Gentle floating pollen, falling leaves, campfire embers.
   - Whispering Forest: Night fireflies, drifting fog/mist ribbons, rain & lightning weather.
   - Endless Echo Ruins: Glowing cyan crystal dust, cavern drip ripples, arcane runes.
5. **VFX Asset Pack & Spell Animations**:
   - Reusable VFX system combining Sprite Sheets, Canvas Procedural Shaders, Lighting glows, and Web Audio synthesis for Fire, Ice, Lightning, Wind, Shadow, and Echo Crystal spells.
6. **Configurable Graphics Quality Settings**:
   - Low, Medium, High, Ultra profiles controlling particle density, dynamic lighting, weather effects, and screen shake.
