import Phaser from 'phaser';

export class PixelTextureGenerator {
  /**
   * Generates all programmatic pixel-art textures and registers them with Phaser.
   */
  static generateAll(scene: Phaser.Scene) {
    this.generateTiles(scene);
    this.generatePlayerSprites(scene);
    this.generateNpcSprites(scene);
    this.generateEnemySprites(scene);
    this.generateCombatFX(scene);
    this.generateProps(scene);
  }

  private static createCanvas(w: number, h: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return { canvas, ctx };
  }

  // --- 1. TILES ---
  private static generateTiles(scene: Phaser.Scene) {
    // Grass Tile (32x32)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#347844';
      ctx.fillRect(0, 0, 32, 32);
      // Grass texture blades
      ctx.fillStyle = '#429355';
      ctx.fillRect(4, 6, 2, 4);
      ctx.fillRect(18, 12, 2, 5);
      ctx.fillRect(26, 22, 2, 4);
      ctx.fillRect(10, 24, 2, 4);
      // Highlights
      ctx.fillStyle = '#56b36e';
      ctx.fillRect(5, 5, 2, 2);
      ctx.fillRect(19, 11, 2, 2);
      // Tiny flower
      ctx.fillStyle = '#fcd34d';
      ctx.fillRect(14, 18, 2, 2);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(13, 17, 2, 2);
      scene.textures.addCanvas('tile_grass', canvas);
    }

    // Cobblestone Path Tile (32x32)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#475569';
      ctx.fillRect(0, 0, 32, 32);
      // Stones
      const stones = [
        { x: 1, y: 1, w: 14, h: 8, col: '#64748b' },
        { x: 17, y: 1, w: 14, h: 6, col: '#505d74' },
        { x: 1, y: 11, w: 10, h: 9, col: '#55637a' },
        { x: 13, y: 9, w: 18, h: 10, col: '#64748b' },
        { x: 1, y: 22, w: 16, h: 9, col: '#505d74' },
        { x: 19, y: 21, w: 12, h: 10, col: '#64748b' },
      ];
      stones.forEach((s) => {
        ctx.fillStyle = s.col;
        ctx.fillRect(s.x, s.y, s.w, s.h);
        ctx.fillStyle = '#94a3b8'; // Stone top highlight
        ctx.fillRect(s.x + 1, s.y + 1, s.w - 2, 1);
      });
      scene.textures.addCanvas('tile_stone', canvas);
    }

    // Dungeon Floor Tile (Standard) (32x32)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#1e2330';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#141824';
      ctx.fillRect(0, 0, 32, 1);
      ctx.fillRect(0, 0, 1, 32);
      ctx.fillRect(0, 31, 32, 1);
      ctx.fillRect(31, 0, 1, 32);
      ctx.fillStyle = '#2c3448';
      ctx.fillRect(6, 8, 4, 2);
      ctx.fillRect(10, 10, 6, 2);
      ctx.fillRect(20, 20, 5, 2);
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(22, 12, 2, 2);
      scene.textures.addCanvas('tile_dungeon_floor', canvas);
    }

    // Dungeon Floor Tile: Clean Stone Slab
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#222838';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#171c28';
      ctx.fillRect(0, 0, 32, 1);
      ctx.fillRect(0, 0, 1, 32);
      ctx.fillStyle = '#2d3549';
      ctx.fillRect(1, 1, 30, 1);
      ctx.fillRect(1, 1, 1, 30);
      scene.textures.addCanvas('tile_dungeon_floor_clean', canvas);
    }

    // Dungeon Floor Tile: Cracked Stone
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#1e2330';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#141824';
      ctx.fillRect(0, 0, 32, 1);
      ctx.fillRect(0, 0, 1, 32);
      // Fissure cracks
      ctx.fillStyle = '#090b10';
      ctx.fillRect(5, 4, 2, 6);
      ctx.fillRect(7, 9, 4, 2);
      ctx.fillRect(11, 10, 2, 7);
      ctx.fillRect(13, 16, 6, 2);
      ctx.fillRect(18, 17, 2, 8);
      // Highlights on crack edge
      ctx.fillStyle = '#333e54';
      ctx.fillRect(6, 3, 2, 1);
      ctx.fillRect(12, 9, 2, 1);
      scene.textures.addCanvas('tile_dungeon_floor_cracked', canvas);
    }

    // Dungeon Floor Tile: Ancient Arcane Rune
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#1a202c';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#121620';
      ctx.fillRect(0, 0, 32, 1);
      ctx.fillRect(0, 0, 1, 32);
      // Glowing concentric rune circle
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(16, 16, 9, 0, Math.PI * 2);
      ctx.stroke();
      // Glowing rune core
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(15, 15, 2, 2);
      ctx.fillRect(16, 9, 1, 3);
      ctx.fillRect(16, 20, 1, 3);
      ctx.fillRect(9, 16, 3, 1);
      ctx.fillRect(20, 16, 3, 1);
      scene.textures.addCanvas('tile_dungeon_floor_rune', canvas);
    }

    // Dungeon Floor Tile: Mossy Lichen
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#1c222e';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#121620';
      ctx.fillRect(0, 0, 32, 1);
      ctx.fillRect(0, 0, 1, 32);
      // Damp moss patches
      ctx.fillStyle = '#14532d';
      ctx.fillRect(4, 6, 8, 7);
      ctx.fillRect(18, 16, 10, 8);
      ctx.fillStyle = '#16a34a';
      ctx.fillRect(6, 7, 4, 4);
      ctx.fillRect(20, 18, 5, 4);
      scene.textures.addCanvas('tile_dungeon_floor_moss', canvas);
    }

    // Dungeon Floor Tile: Dark Water Puddle
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#1e2330';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#0f172a';
      // Puddle body
      ctx.fillStyle = '#075985';
      ctx.beginPath();
      ctx.ellipse(16, 16, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Reflection highlight
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(13, 14, 5, 1);
      ctx.fillRect(17, 16, 3, 1);
      scene.textures.addCanvas('tile_dungeon_floor_puddle', canvas);
    }

    // Dungeon Wall Tile (Standard) (32x32)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#0d111a';
      ctx.fillRect(0, 0, 32, 32);
      // Brick pattern
      ctx.fillStyle = '#1e2436';
      ctx.fillRect(2, 2, 28, 12);
      ctx.fillRect(2, 16, 13, 13);
      ctx.fillRect(17, 16, 13, 13);
      // Highlights & Runes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(14, 6, 4, 4);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(15, 7, 2, 2);
      scene.textures.addCanvas('tile_dungeon_wall', canvas);
    }

    // Dungeon Wall Tile: Cracked Wall
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#181e2c';
      ctx.fillRect(2, 2, 28, 12);
      ctx.fillRect(2, 16, 13, 13);
      ctx.fillRect(17, 16, 13, 13);
      // Heavy stone fracture
      ctx.fillStyle = '#05060a';
      ctx.fillRect(8, 4, 2, 16);
      ctx.fillRect(10, 12, 6, 2);
      ctx.fillRect(16, 14, 2, 10);
      scene.textures.addCanvas('tile_dungeon_wall_cracked', canvas);
    }

    // Dungeon Wall Tile: Wall Mounted Torch
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#0d111a';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#1e2436';
      ctx.fillRect(2, 2, 28, 12);
      ctx.fillRect(2, 16, 13, 13);
      ctx.fillRect(17, 16, 13, 13);
      // Iron sconce bracket
      ctx.fillStyle = '#475569';
      ctx.fillRect(14, 14, 4, 8);
      ctx.fillRect(12, 12, 8, 3);
      // Torch wood & flame
      ctx.fillStyle = '#78350f';
      ctx.fillRect(15, 10, 2, 6);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(14, 5, 4, 5);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(15, 6, 2, 3);
      scene.textures.addCanvas('tile_dungeon_wall_torch', canvas);
    }

    // Water Tile (32x32)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(4, 6, 8, 2);
      ctx.fillRect(18, 14, 10, 2);
      ctx.fillRect(6, 22, 12, 2);
      scene.textures.addCanvas('tile_water', canvas);
    }

    // Village Wood Cottage Wall (32x32)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#452b1f';
      ctx.fillRect(0, 0, 32, 32);
      // Planks
      ctx.fillStyle = '#5c3a2a';
      ctx.fillRect(2, 2, 28, 6);
      ctx.fillRect(2, 10, 28, 6);
      ctx.fillRect(2, 18, 28, 6);
      ctx.fillRect(2, 26, 28, 5);
      // Timber nails
      ctx.fillStyle = '#85533d';
      ctx.fillRect(4, 4, 2, 2);
      ctx.fillRect(26, 4, 2, 2);
      scene.textures.addCanvas('tile_wood_wall', canvas);
    }

    // Village Roof Tile (32x32)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#881337';
      ctx.fillRect(0, 0, 32, 32);
      ctx.fillStyle = '#9f1239';
      ctx.fillRect(0, 4, 32, 6);
      ctx.fillRect(0, 14, 32, 6);
      ctx.fillRect(0, 24, 32, 6);
      scene.textures.addCanvas('tile_roof', canvas);
    }
  }

  // --- 2. PLAYER SPRITES (KAEL) ---
  private static generatePlayerSprites(scene: Phaser.Scene) {
    const directions = ['down', 'up', 'left', 'right'];

    directions.forEach((dir) => {
      // 1. Idle Sprite (32x40)
      {
        const { canvas, ctx } = this.createCanvas(32, 40);
        this.drawKaelFrame(ctx, dir, 0, 'idle');
        scene.textures.addCanvas(`kael_idle_${dir}`, canvas);
      }

      // 2. Walk Animation Frames (4 frames)
      for (let f = 0; f < 4; f++) {
        const { canvas, ctx } = this.createCanvas(32, 40);
        this.drawKaelFrame(ctx, dir, f, 'walk');
        scene.textures.addCanvas(`kael_walk_${dir}_${f}`, canvas);
      }

      // 3. Attack Frames (3 frames)
      for (let f = 0; f < 3; f++) {
        const { canvas, ctx } = this.createCanvas(32, 40);
        this.drawKaelFrame(ctx, dir, f, 'attack');
        scene.textures.addCanvas(`kael_attack_${dir}_${f}`, canvas);
      }

      // 4. Dodge Frames (2 frames)
      for (let f = 0; f < 2; f++) {
        const { canvas, ctx } = this.createCanvas(32, 40);
        this.drawKaelFrame(ctx, dir, f, 'dodge');
        scene.textures.addCanvas(`kael_dodge_${dir}_${f}`, canvas);
      }
    });
  }

  private static drawKaelFrame(
    ctx: CanvasRenderingContext2D,
    dir: string,
    frame: number,
    anim: 'idle' | 'walk' | 'attack' | 'dodge'
  ) {
    // Bob offset
    const bob = anim === 'walk' ? (frame % 2 === 0 ? 0 : 2) : 0;
    const yOff = bob;

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(16, 36, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dodge rolling effect
    if (anim === 'dodge') {
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(16, 26, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(10, 22, 12, 8);
      return;
    }

    // Legs / Boots
    const legOffset = anim === 'walk' ? (frame === 1 ? -2 : frame === 3 ? 2 : 0) : 0;
    ctx.fillStyle = '#334155'; // Charcoal trousers
    ctx.fillRect(12 + legOffset, 24 + yOff, 4, 8);
    ctx.fillRect(16 - legOffset, 24 + yOff, 4, 8);
    ctx.fillStyle = '#5a3d28'; // Brown leather boots
    ctx.fillRect(11 + legOffset, 30 + yOff, 5, 5);
    ctx.fillRect(16 - legOffset, 30 + yOff, 5, 5);

    // Tunic & Leather Jacket Body
    ctx.fillStyle = '#fef3c7'; // Cream medieval tunic
    ctx.fillRect(11, 14 + yOff, 10, 11);
    ctx.fillStyle = '#452b1f'; // Dark brown leather jacket vest
    ctx.fillRect(10, 14 + yOff, 3, 10);
    ctx.fillRect(19, 14 + yOff, 3, 10);
    ctx.fillStyle = '#1e1b4b'; // Belt
    ctx.fillRect(11, 23 + yOff, 10, 2);
    ctx.fillStyle = '#f59e0b'; // Gold belt buckle
    ctx.fillRect(15, 23 + yOff, 2, 2);

    // Navy Blue Scarf
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(11, 12 + yOff, 10, 3);
    if (dir === 'left') {
      ctx.fillRect(18, 14 + yOff, 3, 5); // Scarf tail trailing
    } else if (dir === 'right') {
      ctx.fillRect(9, 14 + yOff, 3, 5);
    } else {
      ctx.fillRect(14, 14 + yOff, 4, 4);
    }

    // Head / Face
    ctx.fillStyle = '#fed7aa'; // Light tan skin
    ctx.fillRect(11, 6 + yOff, 10, 8);

    // Eyes (Icy glowing blue)
    if (dir === 'down') {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(13, 10 + yOff, 2, 2);
      ctx.fillRect(17, 10 + yOff, 2, 2);
      // Scar above left eyebrow
      ctx.fillStyle = '#f87171';
      ctx.fillRect(17, 8 + yOff, 2, 1);
    } else if (dir === 'left') {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(11, 10 + yOff, 2, 2);
    } else if (dir === 'right') {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(19, 10 + yOff, 2, 2);
      // Scar
      ctx.fillStyle = '#f87171';
      ctx.fillRect(18, 8 + yOff, 2, 1);
    }

    // Glowing Blue Echo Crystal Pendant!
    if (dir === 'down') {
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(15, 16 + yOff, 2, 3);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(15, 17 + yOff, 1, 1);
    }

    // Short Messy Charcoal-Black Hair
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(10, 3 + yOff, 12, 5);
    ctx.fillRect(9, 5 + yOff, 3, 4);
    ctx.fillRect(20, 5 + yOff, 3, 4);
    // Spikes/fringe
    ctx.fillRect(12, 7 + yOff, 2, 2);
    ctx.fillRect(15, 6 + yOff, 2, 2);

    // Sword (Melee Attack)
    if (anim === 'attack') {
      ctx.fillStyle = '#94a3b8'; // Steel blade
      ctx.strokeStyle = '#e2e8f0';
      if (dir === 'right') {
        ctx.fillRect(22, 14 + yOff, 10, 3);
        ctx.fillStyle = '#f59e0b'; // Gold crossguard
        ctx.fillRect(20, 13 + yOff, 2, 5);
      } else if (dir === 'left') {
        ctx.fillRect(0, 14 + yOff, 10, 3);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(10, 13 + yOff, 2, 5);
      } else if (dir === 'down') {
        ctx.fillRect(15, 25 + yOff, 3, 11);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(13, 24 + yOff, 7, 2);
      } else {
        ctx.fillRect(15, 0 + yOff, 3, 10);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(13, 8 + yOff, 7, 2);
      }
    }
  }

  // --- 3. NPC SPRITES ---
  private static generateNpcSprites(scene: Phaser.Scene) {
    // Mira (Healer)
    {
      const { canvas, ctx } = this.createCanvas(32, 40);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 36, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Dress
      ctx.fillStyle = '#15803d'; // Herbal Green
      ctx.fillRect(10, 14, 12, 18);
      ctx.fillStyle = '#fef08a'; // Apron
      ctx.fillRect(12, 16, 8, 14);
      // Head & Hair
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(11, 6, 10, 8);
      ctx.fillStyle = '#b45309'; // Chestnut hair
      ctx.fillRect(10, 3, 12, 6);
      ctx.fillRect(9, 6, 3, 10);
      ctx.fillRect(20, 6, 3, 10);
      // Flower in hair
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(20, 4, 3, 3);
      // Eyes
      ctx.fillStyle = '#166534';
      ctx.fillRect(13, 9, 2, 2);
      ctx.fillRect(17, 9, 2, 2);
      scene.textures.addCanvas('npc_mira', canvas);
    }

    // Rowan (Blacksmith)
    {
      const { canvas, ctx } = this.createCanvas(32, 40);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 36, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Muscular body & Leather Smith Apron
      ctx.fillStyle = '#78350f';
      ctx.fillRect(9, 14, 14, 18);
      ctx.fillStyle = '#b45309';
      ctx.fillRect(11, 16, 10, 14);
      // Head & Beard
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(11, 6, 10, 8);
      ctx.fillStyle = '#b91c1c'; // Red-brown beard & hair
      ctx.fillRect(10, 4, 12, 4);
      ctx.fillRect(11, 11, 10, 6);
      // Hammer
      ctx.fillStyle = '#64748b';
      ctx.fillRect(22, 18, 6, 5);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(24, 23, 2, 10);
      scene.textures.addCanvas('npc_rowan', canvas);
    }

    // Elder Orin (Archivist)
    {
      const { canvas, ctx } = this.createCanvas(32, 40);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 36, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Sage Robes
      ctx.fillStyle = '#4338ca'; // Deep Indigo
      ctx.fillRect(9, 14, 14, 20);
      ctx.fillStyle = '#e0e7ff'; // Robe trim
      ctx.fillRect(15, 14, 2, 20);
      // Long White Beard & Hair
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(11, 6, 10, 8);
      ctx.fillStyle = '#f8fafc'; // White beard
      ctx.fillRect(10, 4, 12, 4);
      ctx.fillRect(12, 11, 8, 10);
      // Walking Staff
      ctx.fillStyle = '#78350f';
      ctx.fillRect(7, 8, 2, 26);
      ctx.fillStyle = '#38bdf8'; // Staff gem
      ctx.fillRect(6, 6, 4, 4);
      scene.textures.addCanvas('npc_orin', canvas);
    }

    // Elara (Guild Master)
    {
      const { canvas, ctx } = this.createCanvas(32, 40);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 36, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Armor & Azure Cape
      ctx.fillStyle = '#0284c7'; // Azure Cape
      ctx.fillRect(9, 14, 14, 18);
      ctx.fillStyle = '#cbd5e1'; // Silver breastplate
      ctx.fillRect(11, 14, 10, 10);
      // Head & Golden Hair
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(11, 6, 10, 8);
      ctx.fillStyle = '#eab308'; // Blonde hair
      ctx.fillRect(10, 3, 12, 5);
      ctx.fillRect(9, 7, 3, 12);
      ctx.fillRect(20, 7, 3, 12);
      // Rapier at waist
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(22, 20, 2, 12);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(21, 19, 4, 2);
      scene.textures.addCanvas('npc_elara', canvas);
    }

    // Finn (Merchant)
    {
      const { canvas, ctx } = this.createCanvas(32, 40);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 36, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Clothes
      ctx.fillStyle = '#065f46'; // Emerald tunic
      ctx.fillRect(10, 14, 12, 18);
      // Wide Brim Hat
      ctx.fillStyle = '#78350f';
      ctx.fillRect(7, 4, 18, 3);
      ctx.fillRect(11, 1, 10, 4);
      ctx.fillStyle = '#f59e0b'; // Gold hat band
      ctx.fillRect(11, 4, 10, 1);
      // Face
      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(11, 7, 10, 7);
      // Satchel
      ctx.fillStyle = '#92400e';
      ctx.fillRect(18, 20, 6, 6);
      scene.textures.addCanvas('npc_finn', canvas);
    }
  }

  // --- 4. ENEMY SPRITES ---
  private static generateEnemySprites(scene: Phaser.Scene) {
    // Green Slime (28x24)
    {
      const { canvas, ctx } = this.createCanvas(28, 24);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(14, 21, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Slime Body
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(14, 14, 10, 0, Math.PI, true);
      ctx.lineTo(4, 18);
      ctx.bezierCurveTo(4, 22, 24, 22, 24, 18);
      ctx.closePath();
      ctx.fill();
      // Highlight
      ctx.fillStyle = '#86efac';
      ctx.fillRect(8, 7, 4, 3);
      // Cute Angry Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(9, 12, 3, 3);
      ctx.fillRect(16, 12, 3, 3);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(10, 12, 1, 1);
      ctx.fillRect(17, 12, 1, 1);
      scene.textures.addCanvas('enemy_slime', canvas);
    }

    // Forest Bat (28x24)
    {
      const { canvas, ctx } = this.createCanvas(28, 24);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(14, 22, 8, 2, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wings
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(14, 10);
      ctx.lineTo(2, 4);
      ctx.lineTo(6, 16);
      ctx.lineTo(14, 13);
      ctx.lineTo(22, 16);
      ctx.lineTo(26, 4);
      ctx.closePath();
      ctx.fill();
      // Body
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(11, 8, 6, 8);
      // Red Glowing Eyes
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(12, 10, 2, 2);
      ctx.fillRect(15, 10, 2, 2);
      scene.textures.addCanvas('enemy_bat', canvas);
    }

    // Wild Wolf (36x28)
    {
      const { canvas, ctx } = this.createCanvas(36, 28);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(18, 25, 12, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wolf Fur
      ctx.fillStyle = '#64748b';
      ctx.fillRect(8, 10, 18, 10);
      ctx.fillRect(22, 6, 10, 9); // Head
      // Ears
      ctx.fillStyle = '#334155';
      ctx.fillRect(24, 3, 3, 4);
      ctx.fillRect(29, 3, 3, 4);
      // Legs
      ctx.fillStyle = '#475569';
      ctx.fillRect(10, 20, 3, 6);
      ctx.fillRect(14, 20, 3, 6);
      ctx.fillRect(20, 20, 3, 6);
      ctx.fillRect(24, 20, 3, 6);
      // Snout & Amber Eye
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(28, 9, 2, 2);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(32, 10, 2, 2); // Nose
      scene.textures.addCanvas('enemy_wolf', canvas);
    }

    // Mushroom Guardian (32x36)
    {
      const { canvas, ctx } = this.createCanvas(32, 36);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 33, 10, 3, 0, 0, Math.PI * 2);
      ctx.fill();
      // Stem
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(11, 16, 10, 15);
      // Glowing Cap
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(16, 15, 13, Math.PI, 0);
      ctx.fill();
      // Bioluminescent spots
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(8, 8, 3, 3);
      ctx.fillRect(15, 5, 4, 4);
      ctx.fillRect(22, 9, 3, 3);
      // Eyes
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(12, 20, 2, 3);
      ctx.fillRect(18, 20, 2, 3);
      scene.textures.addCanvas('enemy_mushroom', canvas);
    }

    // Ancient Golem Boss (56x56)
    {
      const { canvas, ctx } = this.createCanvas(56, 56);
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(28, 52, 22, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Massive Stone Torso
      ctx.fillStyle = '#334155';
      ctx.fillRect(16, 16, 24, 26);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(14, 20, 28, 18);
      // Shoulders & Fists
      ctx.fillStyle = '#475569';
      ctx.fillRect(6, 18, 9, 18);
      ctx.fillRect(41, 18, 9, 18);
      // Head
      ctx.fillStyle = '#64748b';
      ctx.fillRect(20, 8, 16, 10);
      // Glowing Ancient Runic Glyph on Chest
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(26, 24, 4, 8);
      ctx.fillRect(23, 26, 10, 3);
      // Glowing Eyes
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(23, 12, 3, 2);
      ctx.fillRect(30, 12, 3, 2);
      scene.textures.addCanvas('boss_golem', canvas);
    }
  }

  // --- 5. COMBAT EFFECTS ---
  private static generateCombatFX(scene: Phaser.Scene) {
    // Slash Arc (36x36)
    {
      const { canvas, ctx } = this.createCanvas(36, 36);
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(18, 18, 14, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(18, 18, 15, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
      scene.textures.addCanvas('fx_slash', canvas);
    }

    // Hit Spark (16x16)
    {
      const { canvas, ctx } = this.createCanvas(16, 16);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(7, 2, 2, 12);
      ctx.fillRect(2, 7, 12, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(6, 6, 4, 4);
      scene.textures.addCanvas('fx_hit_spark', canvas);
    }

    // Arcane Crystal Lance Beam (48x16)
    {
      const { canvas, ctx } = this.createCanvas(48, 16);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(0, 5, 48, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, 6, 48, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 7, 44, 2);
      // Arrowhead
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(48, 8);
      ctx.lineTo(40, 2);
      ctx.lineTo(40, 14);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas('fx_crystal_beam', canvas);
    }

    // Whirlwind Ring (48x48)
    {
      const { canvas, ctx } = this.createCanvas(48, 48);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(24, 24, 20, 0, Math.PI * 2);
      ctx.stroke();
      scene.textures.addCanvas('fx_whirlwind', canvas);
    }
  }

  // --- 6. PROPS & INTERACTABLES ---
  private static generateProps(scene: Phaser.Scene) {
    // Treasure Chest (Closed) (24x24)
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(3, 7, 18, 14);
      ctx.fillStyle = '#a16207';
      ctx.fillRect(3, 7, 18, 6); // Lid
      ctx.fillStyle = '#eab308'; // Gold bands & latch
      ctx.fillRect(3, 9, 18, 2);
      ctx.fillRect(10, 11, 4, 5);
      scene.textures.addCanvas('prop_chest', canvas);
    }

    // Echo Crystal Monolith (32x48)
    {
      const { canvas, ctx } = this.createCanvas(32, 48);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(16, 44, 12, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Stone Pedestal
      ctx.fillStyle = '#334155';
      ctx.fillRect(8, 36, 16, 8);
      // Floating Crystal Prism
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(16, 4);
      ctx.lineTo(24, 22);
      ctx.lineTo(16, 34);
      ctx.lineTo(8, 22);
      ctx.closePath();
      ctx.fill();
      // Highlights
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(16, 4);
      ctx.lineTo(24, 22);
      ctx.lineTo(16, 34);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(15, 12, 2, 8);
      scene.textures.addCanvas('prop_crystal', canvas);
    }

    // Rowan's Blacksmith Anvil & Forge (40x36)
    {
      const { canvas, ctx } = this.createCanvas(40, 36);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(4, 10, 16, 22); // Forge base
      ctx.fillStyle = '#ef4444'; // Hot coals
      ctx.fillRect(6, 12, 12, 8);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(8, 14, 8, 4);
      // Anvil
      ctx.fillStyle = '#475569';
      ctx.fillRect(24, 18, 12, 6);
      ctx.fillRect(26, 24, 8, 8);
      ctx.fillRect(23, 18, 4, 3);
      scene.textures.addCanvas('prop_forge', canvas);
    }

    // Large Oak Tree (64x72)
    {
      const { canvas, ctx } = this.createCanvas(64, 72);
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(32, 66, 20, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      // Trunk
      ctx.fillStyle = '#452b1f';
      ctx.fillRect(27, 44, 10, 24);
      // Foliage
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(32, 34, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(28, 28, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4ade80';
      ctx.beginPath();
      ctx.arc(24, 22, 10, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('prop_tree', canvas);
    }

    // Light Disc for Dynamic Radial Lighting (128x128)
    {
      const { canvas, ctx } = this.createCanvas(128, 128);
      const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.35, 'rgba(255, 255, 255, 0.65)');
      grad.addColorStop(0.7, 'rgba(255, 255, 255, 0.18)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 128);
      scene.textures.addCanvas('vfx_light_disc', canvas);
    }

    // Dungeon Brazier (Standing Lit Torch) (24x32)
    {
      const { canvas, ctx } = this.createCanvas(24, 32);
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(12, 30, 8, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Iron Stand
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(8, 26, 8, 4); // base
      ctx.fillRect(11, 14, 2, 12); // pole
      ctx.fillRect(7, 10, 10, 5); // iron bowl
      // Hot coals
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(8, 9, 8, 3);
      // Flame core
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(12, 1);
      ctx.lineTo(16, 9);
      ctx.lineTo(8, 9);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(11, 4, 2, 4);
      scene.textures.addCanvas('prop_brazier_lit', canvas);
    }

    // Dungeon Stone Pillar (32x48)
    {
      const { canvas, ctx } = this.createCanvas(32, 48);
      // Base
      ctx.fillStyle = '#111827';
      ctx.fillRect(4, 40, 24, 8);
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(6, 38, 20, 2);
      // Column shaft
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(8, 8, 16, 30);
      // Fluted highlights
      ctx.fillStyle = '#334155';
      ctx.fillRect(9, 8, 3, 30);
      ctx.fillRect(15, 8, 3, 30);
      ctx.fillRect(20, 8, 3, 30);
      // Capital top
      ctx.fillStyle = '#1f2937';
      ctx.fillRect(6, 6, 20, 2);
      ctx.fillStyle = '#111827';
      ctx.fillRect(4, 2, 24, 4);
      scene.textures.addCanvas('prop_dungeon_pillar', canvas);
    }

    // Dungeon Floor Bones & Skull Decal (24x24)
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#94a3b8';
      // Skull
      ctx.beginPath();
      ctx.arc(8, 10, 4, 0, Math.PI * 2);
      ctx.fill();
      // Eye sockets
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(7, 10, 1, 1);
      ctx.fillRect(9, 10, 1, 1);
      // Scattered ribs / femurs
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(14, 12, 8, 2);
      ctx.fillRect(12, 16, 7, 2);
      ctx.fillRect(4, 17, 6, 2);
      scene.textures.addCanvas('prop_dungeon_bones', canvas);
    }

    // Dungeon Chains (16x32)
    {
      const { canvas, ctx } = this.createCanvas(16, 32);
      ctx.fillStyle = '#334155';
      ctx.fillRect(6, 0, 4, 4); // mount ring
      for (let y = 4; y < 28; y += 6) {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(6, y, 4, 5);
      }
      scene.textures.addCanvas('prop_dungeon_chains', canvas);
    }

    // Dungeon Arcane Altar (32x32)
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(2, 20, 28, 12);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(4, 8, 24, 12);
      // Runic carved glyphs
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(8, 12, 4, 4);
      ctx.fillRect(14, 10, 4, 6);
      ctx.fillRect(20, 12, 4, 4);
      // Glowing crystal shard in center
      ctx.fillStyle = '#0ea5e9';
      ctx.beginPath();
      ctx.moveTo(16, 2);
      ctx.lineTo(20, 8);
      ctx.lineTo(16, 12);
      ctx.lineTo(12, 8);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas('prop_dungeon_altar', canvas);
    }
  }
}
