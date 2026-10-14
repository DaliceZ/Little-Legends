# Expanded Skill System Specification (36 Skills)
# Little Legends: Endless World — V2 Upgrade

## Overview

The skill system expands to **6 distinct specializations** containing 6 fully playable skills each (36 skills total). Every skill possesses custom formulas, resource costs (Stamina or Mana), targeting behaviors, procedural audio hooks, and sprite-animation/particle VFX.

---

## 1. Class 1: Blade Dancer (Physical / Wind / Mobility)
1. **Quick Slash** (`skill_bd_quick_slash`): Rapid 0.2s strike hitting for 120% ATK damage. Generates 5 SP.
2. **Crescent Blade** (`skill_bd_crescent`): Wide 180-degree wind blade cutting through enemies for 160% ATK damage.
3. **Dash Strike** (`skill_bd_dash_strike`): Forward lunging thrust piercing through enemies for 180% ATK damage with invulnerability during dash.
4. **Blade Storm** (`skill_bd_blade_storm`): Whirling 360-degree blade cyclone striking all adjacent foes 3 times for 80% ATK each.
5. **Phantom Cut** (`skill_bd_phantom_cut`): Teleports behind target delivering a swift critical strike for 240% ATK damage.
6. **Thousand Blades** (`skill_bd_ultimate`): Ultimate. Unleashes an 8-hit rapid-slash flurry with speed trails dealing 450% total ATK damage.

---

## 2. Class 2: Guardian (Physical / Earth / Defense)
7. **Shield Bash** (`skill_gd_shield_bash`): Heavy shield strike dealing 130% ATK and stunning the target for 1.2s.
8. **Iron Guard** (`skill_gd_iron_guard`): Raises an impenetrable barrier reducing all incoming damage by 65% for 4s.
9. **Ground Slam** (`skill_gd_ground_slam`): Slams the earth creating a radial shockwave that slows and damages foes for 170% ATK.
10. **Counter Stance** (`skill_gd_counter`): Enters a parry stance; any enemy hitting Kael triggers an automatic 250% counterattack.
11. **Guardian Aura** (`skill_gd_aura`): Passive / Active. Increases Max HP by 20% and regenerates 3% HP per second.
12. **Titan's Judgment** (`skill_gd_ultimate`): Ultimate. Summons a massive spectral hammer crashing from above dealing 500% ATK in a massive area.

---

## 3. Class 3: Fire Mage (Elemental / Fire / Area of Effect)
13. **Fireball** (`skill_fm_fireball`): Launches a fiery projectile that explodes on impact dealing 160% Magic ATK.
14. **Flame Wave** (`skill_fm_flame_wave`): Unleashes a blazing cone of fire burning all caught enemies for 190% Magic ATK.
15. **Burning Circle** (`skill_fm_burning_circle`): Ignites the ground for 5s, dealing 40% Magic ATK every 0.5s to enemies inside.
16. **Meteor Strike** (`skill_fm_meteor`): Calls down a fiery meteor from the skies with a 1s telegraph circle dealing 320% Magic ATK.
17. **Phoenix Flame** (`skill_fm_phoenix`): Emits a burst of sacred fire that damages nearby foes for 180% and heals Kael for 25% of damage dealt.
18. **Inferno Cataclysm** (`skill_fm_ultimate`): Ultimate. Summons a catastrophic firestorm filling the screen with blazing pillars dealing 550% total damage.

---

## 4. Class 4: Frost Mage (Elemental / Ice / Crowd Control)
19. **Ice Spear** (`skill_fr_ice_spear`): Hurls a sharp piercing icicle piercing up to 3 enemies for 170% Magic ATK.
20. **Frost Nova** (`skill_fr_frost_nova`): Emits a ring of sub-zero frost freezing all adjacent enemies solid for 2.0s.
21. **Frozen Armor** (`skill_fr_frozen_armor`): Envelops Kael in crystalline ice, absorbing damage equal to 30% Max HP.
22. **Blizzard** (`skill_fr_blizzard`): Summons a freezing storm raining ice shards over an area for 4s, slowing enemies by 50%.
23. **Crystal Prison** (`skill_fr_crystal_prison`): Traps target foe in an ice glacier, preventing movement and dealing 220% Magic ATK over 3s.
24. **Absolute Zero** (`skill_fr_ultimate`): Ultimate. Flash freezes the entire battlefield, dealing 480% Magic ATK and shattering frozen targets for bonus damage.

---

## 5. Class 5: Shadow Assassin (Shadow / Poison / Execution)
25. **Shadow Step** (`skill_sa_shadow_step`): Instant targeted teleport up to 200 pixels towards mouse cursor with 0.5s invisibility.
26. **Poison Blade** (`skill_sa_poison_blade`): Coats weapon in lethal toxin; attacks inflict stacking poison dealing 30% damage/sec for 6s.
27. **Phantom Clone** (`skill_sa_phantom_clone`): Summons a shadowy decoy that distracts enemies and mimics basic attacks for 4s.
28. **Dark Veil** (`skill_sa_dark_veil`): Shrouds Kael in smoke, granting 100% dodge chance for 2s and increasing Crit Chance by 25%.
29. **Soul Reaper** (`skill_sa_soul_reaper`): High-damage strike dealing 280% ATK, increased to 450% if target is below 35% HP.
30. **Eclipse** (`skill_sa_ultimate`): Ultimate. Plunges the area into total darkness before unleashing 6 shadowy strikes dealing 520% total damage.

---

## 6. Class 6: Echo Sorcerer (Arcane / Crystal / Energy)
31. **Echo Bolt** (`skill_es_echo_bolt`): Fires a homing bolt of blue crystal energy that ricochets between up to 2 targets for 150% Magic ATK.
32. **Crystal Barrier** (`skill_es_crystal_barrier`): Deploys an orbiting prism that reflects hostile projectiles and restores 15 MP.
33. **Resonance Pulse** (`skill_es_resonance_pulse`): Emits an expanding circular shockwave knocking back enemies and dealing 190% damage.
34. **Echo Rift** (`skill_es_echo_rift`): Tears open a dimensional rift pulling surrounding monsters toward its vortex.
35. **Astral Beam** (`skill_es_astral_beam`): Channels a concentrated beam of continuous cyan crystal light dealing 100% damage per tick.
36. **Celestial Resonance** (`skill_es_ultimate`): Ultimate. Detonates Kael's Echo Crystal in a cosmic explosion dealing 600% damage across the entire room.
