# Game Design Document (GDD)
# Little Legends: Endless World

## 1. Executive Summary

- **Title**: Little Legends: Endless World
- **Genre**: 2D Top-Down Fantasy RPG + Roguelite Dungeon Crawler + Life Simulation
- **Platform**: Modern Desktop Web Browsers (Chrome, Firefox, Safari, Edge)
- **Target Audience**: Fans of classic Zelda, Stardew Valley, Hyper Light Drifter, and Moonlighter.
- **Languages**: English and Thai (ไทย)
- **Core Loop**: Prepare in Everlight Village -> Enter Wilderness / Dungeon -> Real-time Combat & Exploration -> Slay Monsters & Bosses -> Return with Loot -> Craft & Upgrade -> Unlock New Skills and Endless Tiers.

---

## 2. Narrative & Protagonist

### Kael, The Lost Wanderer
- **Background**: Kael awakes at the perimeter of Everlight Village, clutching a pulsing crystalline relic known as the **Echo Crystal Pendant**. Having lost his memories, the resonance of the crystal guides him toward forgotten ruins and dangerous caverns.
- **Key Relationships**:
  - **Elder Orin**: The village archivist who deciphers ancient scripts on the Echo Crystal.
  - **Mira**: The herbalist and healer who revived Kael when he was found unconscious.
  - **Rowan**: Master blacksmith who knows how to forge Echo-infused weapons.
  - **Elara**: Guild master of the Wayfarers, commissioning expeditions into the depths.
  - **Finn**: General store merchant with an eye for dungeon trinkets and supplies.

---

## 3. World & Environment

### Main Hub: Everlight Village
- A tranquil, stone-paved hamlet with timbered cottages, lanterns, blooming blossom trees, a training dummy, storage chest, notice board, and blacksmith forge.
- Serves as the safe zone where HP and MP regenerate, quests are organized, and equipment is forged.

### Exploration Regions
1. **Whispering Forest (Level 1-3)**: Lush woods, overgrown roots, Slimes, Bats, and Wolves.
2. **Crystal Caverns (Level 4-7)**: Bioluminescent caverns, Mushroom Guardians, toxic spores, and crystal veins.
3. **Forgotten Ruins (Level 8-12)**: Ancient stonework, runic traps, and the Ancient Golem boss.
4. **Endless Echo (Endgame Roguelite)**: Dynamically generated dungeon floors with ascending difficulty modifiers, rare affixes, and leaderboard-style depth achievements.

---

## 4. Combat Mechanics & Systems

### Real-Time Melee & Ranged Action
- **Melee Combo**: 3-hit slash sequence with forward micro-step and attack hitboxes.
- **Dodge Roll**: 350ms duration, 250ms invulnerability window, 25 Stamina cost.
- **Active Skills**:
  - *Blade Dance* (Blade Dancer): Whirlwind spinning strike hitting all adjacent foes.
  - *Iron Bastion* (Guardian): Frontal shield absorb that mitigates 80% damage and reflects stun.
  - *Crystal Lance* (Echo Mage): Piercing beam of icy arcane light damaging enemies in a straight line.

### Damage Model
$$\text{Base Damage} = \text{Attack} \times \text{Skill Multiplier}$$
$$\text{Mitigated Damage} = \text{Base Damage} \times \left(\frac{100}{100 + \text{Defense}}\right)$$
$$\text{Critical Damage} = \text{Mitigated Damage} \times \text{Critical Multiplier}$$

- Minimum damage is guaranteed to be at least 1.
- All stats have explicit caps (e.g., Crit Chance capped at 75%).
- Damage numbers float upward with color coding (White = normal, Yellow = critical, Red = damage taken, Green = healing).

---

## 5. Economy & Progression

- **Currencies**: Gold (standard trade), Echo Shards (dungeon extraction material for high-tier upgrades).
- **Rarity Tiers**:
  1. *Common* (Grey): Base stats only.
  2. *Uncommon* (Green): +1 minor random affix.
  3. *Rare* (Blue): +2 affixes, higher base stat range.
  4. *Epic* (Purple): +3 affixes, unique passive effect.
  5. *Legendary* (Gold): Distinctive special mechanic and premier stats.
- **Progression**: Character Level 1-20, skill talent points, permanent unlocked shortcuts, and achievement trophies.
