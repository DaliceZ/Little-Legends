import Phaser from 'phaser';
import { useGameStore } from '../../app/store/useGameStore';
import { calculateDamage } from '../../features/combat/combatCalculations';
import { soundManager } from '../../shared/utils/soundSynthesizer';
import { QuestManager } from '../../features/quests/questManager';

interface EnemyInstance {
  sprite: Phaser.Physics.Arcade.Sprite;
  type: 'slime' | 'bat' | 'wolf';
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  state: 'idle' | 'patrol' | 'chase' | 'attack' | 'hurt' | 'dead';
  stateTimer: number;
  attackCooldown: number;
  originX: number;
  originY: number;
  healthBar: Phaser.GameObjects.Graphics;
}

export class WorldScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: { [key: string]: Phaser.Input.Keyboard.Key };
  private interactKey!: Phaser.Input.Keyboard.Key;
  private attackKey!: Phaser.Input.Keyboard.Key;
  private skillKey!: Phaser.Input.Keyboard.Key;
  private sprintKey!: Phaser.Input.Keyboard.Key;
  private dodgeKey!: Phaser.Input.Keyboard.Key;

  private currentDirection: 'down' | 'up' | 'left' | 'right' = 'down';
  private isAttacking: boolean = false;
  private isDodging: boolean = false;
  private isDodgeInvulnerable: boolean = false;

  private npcs: { id: string; name: string; sprite: Phaser.GameObjects.Sprite; x: number; y: number }[] = [];
  private enemies: EnemyInstance[] = [];
  private interactPrompt!: Phaser.GameObjects.Text;
  private slashHitbox!: Phaser.GameObjects.Rectangle;

  private lastAttackTime: number = 0;
  private lastSkillTime: number = 0;
  private staminaRegenTimer: number = 0;

  constructor() {
    super({ key: 'WorldScene' });
  }

  create() {
    // 1. Create Tilemap Geometry (World bounds: 1600x1200)
    this.physics.world.setBounds(0, 0, 1600, 1200);

    // Fill background with lush grass
    for (let x = 0; x < 1600; x += 32) {
      for (let y = 0; y < 1200; y += 32) {
        this.add.image(x + 16, y + 16, 'tile_grass');
      }
    }

    // Everlight Village Cobblestone Roads & Squares (x: 200 to 800, y: 200 to 800)
    for (let x = 240; x < 800; x += 32) {
      this.add.image(x + 16, 480, 'tile_stone');
      this.add.image(x + 16, 512, 'tile_stone');
    }
    for (let y = 200; y < 900; y += 32) {
      this.add.image(480, y + 16, 'tile_stone');
      this.add.image(512, y + 16, 'tile_stone');
    }
    // Village Plaza
    for (let x = 400; x < 600; x += 32) {
      for (let y = 400; y < 600; y += 32) {
        this.add.image(x + 16, y + 16, 'tile_stone');
      }
    }

    // Village River (x: 880 to 940, flows north to south)
    const riverObstacles = this.physics.add.staticGroup();
    for (let y = 0; y < 1200; y += 32) {
      this.add.image(896, y + 16, 'tile_water');
      this.add.image(928, y + 16, 'tile_water');
      // Bridge at y: 480-520
      if (y < 460 || y > 530) {
        const blk = riverObstacles.create(912, y + 16, undefined);
        blk.setSize(64, 32).setVisible(false);
      } else {
        // Wood Bridge
        this.add.image(896, y + 16, 'tile_wood_wall');
        this.add.image(928, y + 16, 'tile_wood_wall');
      }
    }

    // Village Cottages (Solid obstacles)
    const buildings = this.physics.add.staticGroup();
    this.createCottage(buildings, 260, 240, 'Mira’s Clinic');
    this.createCottage(buildings, 680, 240, 'Rowan’s Forge');
    this.createCottage(buildings, 260, 680, 'Finn’s General Store');
    this.createCottage(buildings, 680, 680, 'Wayfarer Guild');

    // Props: Anvil, Monolith, Trees
    this.add.image(660, 310, 'prop_forge');
    this.add.image(500, 470, 'prop_crystal');
    this.createTreeGrove();

    // 2. Spawn Interactive NPCs
    this.spawnNPCs();

    // 3. Spawn Kael (Player)
    this.player = this.physics.add.sprite(480, 520, 'kael_idle_down');
    this.player.setSize(18, 16).setOffset(7, 24);
    this.player.setCollideWorldBounds(true);

    // Collisions
    this.physics.add.collider(this.player, buildings);
    this.physics.add.collider(this.player, riverObstacles);

    // 4. Setup Camera
    this.cameras.main.setBounds(0, 0, 1600, 1200);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // 5. Setup Controls
    this.setupControls();

    // 6. Interaction Prompt HUD element
    this.interactPrompt = this.add.text(0, 0, '[E] Talk', {
      fontSize: '12px',
      color: '#fef3c7',
      backgroundColor: '#1e293b',
      padding: { x: 6, y: 3 },
    }).setOrigin(0.5, 1).setVisible(false).setDepth(100);

    // 7. Melee Slash Hitbox (Inactive until attack key)
    this.slashHitbox = this.add.rectangle(0, 0, 36, 36, 0x38bdf8, 0);
    this.physics.add.existing(this.slashHitbox);
    (this.slashHitbox.body as Phaser.Physics.Arcade.Body).enable = false;

    // 8. Spawn Enemies in Whispering Forest (East of river, x: 1000 to 1500)
    this.spawnForestEnemies();

    // 9. Northern Dungeon Portal Arch (x: 480-520, y: 40)
    this.add.sprite(500, 48, 'prop_crystal').setScale(1.2);
    this.add.text(500, 18, 'Dungeon Gate', {
      fontSize: '11px',
      color: '#38bdf8',
      backgroundColor: '#0c0d14',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);

    // Trigger dungeon enter on overlap
    const portalZone = this.physics.add.staticSprite(500, 50, 'prop_crystal');
    portalZone.setSize(48, 32).setVisible(false);
    this.physics.add.overlap(this.player, portalZone, () => {
      this.enterDungeon();
    });

    // Start cozy village ambient music
    soundManager.playMusic('village');
    useGameStore.getState().setZone('village');
  }

  private createCottage(group: Phaser.Physics.Arcade.StaticGroup, x: number, y: number, name: string) {
    // 4x3 tiles cottage
    for (let dx = 0; dx < 128; dx += 32) {
      for (let dy = 0; dy < 96; dy += 32) {
        if (dy === 0) {
          this.add.image(x + dx + 16, y + dy + 16, 'tile_roof');
        } else {
          this.add.image(x + dx + 16, y + dy + 16, 'tile_wood_wall');
        }
      }
    }
    const b = group.create(x + 64, y + 48, undefined);
    b.setSize(128, 96).setVisible(false);

    this.add.text(x + 64, y - 8, name, {
      fontSize: '10px',
      color: '#fbbf24',
      backgroundColor: '#141622',
      padding: { x: 4, y: 2 },
    }).setOrigin(0.5);
  }

  private createTreeGrove() {
    const treeCoords = [
      { x: 140, y: 120 }, { x: 820, y: 100 }, { x: 180, y: 840 },
      { x: 800, y: 880 }, { x: 1050, y: 200 }, { x: 1350, y: 160 },
      { x: 1100, y: 850 }, { x: 1420, y: 920 }, { x: 1250, y: 550 },
    ];
    treeCoords.forEach((c) => {
      this.add.image(c.x, c.y, 'prop_tree').setDepth(c.y);
    });
  }

  private spawnNPCs() {
    const npcDefs = [
      { id: 'orin', name: 'Elder Orin', x: 460, y: 440, spriteKey: 'npc_orin' },
      { id: 'mira', name: 'Mira (Healer)', x: 380, y: 320, spriteKey: 'npc_mira' },
      { id: 'rowan', name: 'Rowan (Smith)', x: 620, y: 320, spriteKey: 'npc_rowan' },
      { id: 'elara', name: 'Elara (Guild)', x: 620, y: 720, spriteKey: 'npc_elara' },
      { id: 'finn', name: 'Finn (Merchant)', x: 380, y: 720, spriteKey: 'npc_finn' },
    ];

    npcDefs.forEach((d) => {
      const sprite = this.add.sprite(d.x, d.y, d.spriteKey).setDepth(d.y);
      this.add.text(d.x, d.y - 28, d.name, {
        fontSize: '10px',
        color: '#e2e8f0',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        padding: { x: 4, y: 2 },
      }).setOrigin(0.5);

      this.npcs.push({ id: d.id, name: d.name, sprite, x: d.x, y: d.y });
    });
  }

  private spawnForestEnemies() {
    const spawns: { x: number; y: number; type: 'slime' | 'bat' | 'wolf' }[] = [
      { x: 1040, y: 320, type: 'slime' },
      { x: 1180, y: 360, type: 'slime' },
      { x: 1320, y: 280, type: 'slime' },
      { x: 1100, y: 500, type: 'bat' },
      { x: 1260, y: 480, type: 'bat' },
      { x: 1380, y: 640, type: 'wolf' },
      { x: 1150, y: 720, type: 'wolf' },
      { x: 1400, y: 800, type: 'wolf' },
    ];

    spawns.forEach((s) => {
      const sprite = this.physics.add.sprite(s.x, s.y, `enemy_${s.type}`);
      sprite.setSize(20, 18).setCollideWorldBounds(true);

      const maxHp = s.type === 'slime' ? 35 : s.type === 'bat' ? 25 : 60;
      const attack = s.type === 'slime' ? 8 : s.type === 'bat' ? 12 : 16;
      const defense = s.type === 'slime' ? 2 : s.type === 'bat' ? 1 : 4;
      const speed = s.type === 'slime' ? 50 : s.type === 'bat' ? 95 : 110;

      const healthBar = this.add.graphics().setDepth(150);

      const enemy: EnemyInstance = {
        sprite,
        type: s.type,
        hp: maxHp,
        maxHp,
        attack,
        defense,
        speed,
        state: 'patrol',
        stateTimer: 0,
        attackCooldown: 0,
        originX: s.x,
        originY: s.y,
        healthBar,
      };

      this.enemies.push(enemy);
    });
  }

  private setupControls() {
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as { [key: string]: Phaser.Input.Keyboard.Key };

    this.interactKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.attackKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.J);
    this.skillKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.K);
    this.sprintKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
    this.dodgeKey = this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // Mouse left click attack
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.performAttack();
      }
    });
  }

  update(time: number, delta: number) {
    // Check if modal or dialogue is open in React; if so, halt movement
    const gameStore = useGameStore.getState();
    const isPaused = gameStore.activeModal !== 'none' || gameStore.currentDialogue !== null;

    if (isPaused) {
      this.player.setVelocity(0, 0);
      return;
    }

    // Handle Player Input & Movement
    this.handlePlayerInput(time, delta);

    // Handle Proximity Interactions (NPCs)
    this.handleInteractions();

    // Handle Enemy AI & Behaviors
    this.updateEnemies(time, delta);

    // Natural Stamina & MP Regen
    this.staminaRegenTimer += delta;
    if (this.staminaRegenTimer >= 200) {
      this.staminaRegenTimer = 0;
      if (!this.isDodging && !this.sprintKey.isDown) {
        if (gameStore.stats.sp < gameStore.stats.maxSp) {
          gameStore.setPlayerStats({
            ...gameStore.stats,
            sp: Math.min(gameStore.stats.maxSp, gameStore.stats.sp + 4),
          });
        }
      }
      if (gameStore.stats.mp < gameStore.stats.maxMp) {
        gameStore.setPlayerStats({
          ...gameStore.stats,
          mp: Math.min(gameStore.stats.maxMp, gameStore.stats.mp + 1),
        });
      }
    }
  }

  private handlePlayerInput(_time: number, delta: number) {
    if (this.isAttacking || this.isDodging) return;

    let vx = 0;
    let vy = 0;

    const left = this.cursors.left.isDown || this.wasdKeys.left.isDown;
    const right = this.cursors.right.isDown || this.wasdKeys.right.isDown;
    const up = this.cursors.up.isDown || this.wasdKeys.up.isDown;
    const down = this.cursors.down.isDown || this.wasdKeys.down.isDown;

    if (left) vx -= 1;
    if (right) vx += 1;
    if (up) vy -= 1;
    if (down) vy += 1;

    const gameStore = useGameStore.getState();
    const isSprinting = this.sprintKey.isDown && gameStore.stats.sp > 5 && (vx !== 0 || vy !== 0);
    const speedMult = isSprinting ? 1.45 : 1.0;
    const baseSpeed = gameStore.stats.speed;

    if (isSprinting) {
      gameStore.setPlayerStats({
        ...gameStore.stats,
        sp: Math.max(0, gameStore.stats.sp - (delta * 0.015)),
      });
    }

    // Normalize diagonal
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx * baseSpeed * speedMult, vy * baseSpeed * speedMult);

    // Direction tracking
    if (vx < 0) this.currentDirection = 'left';
    else if (vx > 0) this.currentDirection = 'right';
    else if (vy < 0) this.currentDirection = 'up';
    else if (vy > 0) this.currentDirection = 'down';

    // Animation
    if (vx !== 0 || vy !== 0) {
      this.player.anims.play(`kael_walk_${this.currentDirection}`, true);
    } else {
      this.player.anims.stop();
      this.player.setTexture(`kael_idle_${this.currentDirection}`);
    }

    // Depth sorting
    this.player.setDepth(this.player.y);

    // Action Key Checks
    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.performAttack();
    } else if (Phaser.Input.Keyboard.JustDown(this.dodgeKey)) {
      this.performDodge();
    } else if (Phaser.Input.Keyboard.JustDown(this.skillKey)) {
      this.performSkill();
    }
  }

  private performAttack() {
    const gameStore = useGameStore.getState();
    const now = this.time.now;
    if (now - this.lastAttackTime < 320) return;
    if (gameStore.stats.sp < 10) {
      gameStore.showNotification('LOW STAMINA', 'Exhausted! Wait for stamina to recover.', 'warning');
      return;
    }

    this.lastAttackTime = now;
    this.isAttacking = true;
    this.player.setVelocity(0, 0);

    // Consume stamina
    gameStore.setPlayerStats({
      ...gameStore.stats,
      sp: Math.max(0, gameStore.stats.sp - 10),
    });

    // Play attack anim & sound
    this.player.anims.play(`kael_attack_${this.currentDirection}`, true);
    soundManager.playSfx('slash');

    // Visual Slash Effect
    let slashX = this.player.x;
    let slashY = this.player.y;
    let angle = 0;

    if (this.currentDirection === 'right') {
      slashX += 24;
      angle = 0;
    } else if (this.currentDirection === 'left') {
      slashX -= 24;
      angle = 180;
    } else if (this.currentDirection === 'down') {
      slashY += 24;
      angle = 90;
    } else {
      slashY -= 24;
      angle = -90;
    }

    const slashFx = this.add.sprite(slashX, slashY, 'fx_slash')
      .setAngle(angle)
      .setDepth(this.player.y + 10);
    this.tweens.add({
      targets: slashFx,
      alpha: 0,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 180,
      onComplete: () => slashFx.destroy(),
    });

    // Hitbox overlap detection against enemies
    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      const dist = Phaser.Math.Distance.Between(slashX, slashY, enemy.sprite.x, enemy.sprite.y);
      if (dist < 42) {
        this.hitEnemy(enemy);
      }
    });

    this.time.delayedCall(250, () => {
      this.isAttacking = false;
    });
  }

  private hitEnemy(enemy: EnemyInstance) {
    const gameStore = useGameStore.getState();
    const dmg = calculateDamage(
      gameStore.stats.attack,
      enemy.defense,
      gameStore.stats.critChance,
      gameStore.stats.critDamage
    );

    enemy.hp -= dmg.finalDamage;
    soundManager.playSfx('hit');

    // Impact spark FX
    const spark = this.add.sprite(enemy.sprite.x, enemy.sprite.y, 'fx_hit_spark').setDepth(300);
    this.tweens.add({
      targets: spark,
      alpha: 0,
      scale: 1.4,
      duration: 150,
      onComplete: () => spark.destroy(),
    });

    // Floating damage number
    this.showFloatingDamage(enemy.sprite.x, enemy.sprite.y - 16, dmg.finalDamage, dmg.isCritical);

    // Knockback
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y);
    enemy.sprite.setVelocity(Math.cos(angle) * 140, Math.sin(angle) * 140);
    enemy.sprite.setTint(0xff5555);

    this.time.delayedCall(160, () => {
      if (enemy.sprite.active) {
        enemy.sprite.clearTint();
      }
    });

    // Check Death
    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
    }
  }

  private showFloatingDamage(x: number, y: number, amount: number, isCrit: boolean) {
    const text = this.add.text(x, y, isCrit ? `CRIT! -${amount}` : `-${amount}`, {
      fontSize: isCrit ? '14px' : '11px',
      color: isCrit ? '#fbbf24' : '#ffffff',
      stroke: '#000000',
      strokeThickness: 3,
    }).setOrigin(0.5).setDepth(400);

    this.tweens.add({
      targets: text,
      y: y - 24,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy(),
    });
  }

  private killEnemy(enemy: EnemyInstance) {
    enemy.state = 'dead';
    enemy.healthBar.destroy();

    // EXP and Gold rewards
    const expGain = enemy.type === 'slime' ? 25 : enemy.type === 'bat' ? 30 : 50;
    const goldGain = enemy.type === 'slime' ? 6 : enemy.type === 'bat' ? 8 : 15;
    useGameStore.getState().updateExpAndGold(expGain, goldGain);

    // Loot drop chances
    if (enemy.type === 'slime') {
      useGameStore.getState().addItemToInventory('item_slime_gel', 1);
    } else if (enemy.type === 'bat') {
      useGameStore.getState().addItemToInventory('item_bat_wing', 1);
    } else if (enemy.type === 'wolf') {
      useGameStore.getState().addItemToInventory('item_wolf_pelt', 1);
    }

    // Update quest kills
    const curQuests = useGameStore.getState().quests;
    const { updatedQuests, anyCompleted } = QuestManager.recordKill(curQuests, enemy.type);
    useGameStore.getState().setQuests(updatedQuests);
    if (anyCompleted) {
      soundManager.playSfx('quest');
      useGameStore.getState().showNotification('OBJECTIVE COMPLETE', 'Return to village to claim reward!', 'success');
    }

    // Death fadeout
    this.tweens.add({
      targets: enemy.sprite,
      alpha: 0,
      duration: 350,
      onComplete: () => {
        enemy.sprite.destroy();
      },
    });

    // Respawn after 12 seconds
    this.time.delayedCall(12000, () => {
      const respawnedSprite = this.physics.add.sprite(enemy.originX, enemy.originY, `enemy_${enemy.type}`);
      respawnedSprite.setSize(20, 18).setCollideWorldBounds(true);
      enemy.sprite = respawnedSprite;
      enemy.hp = enemy.maxHp;
      enemy.state = 'patrol';
      enemy.healthBar = this.add.graphics().setDepth(150);
    });
  }

  private performDodge() {
    const gameStore = useGameStore.getState();
    if (gameStore.stats.sp < 25) return;

    this.isDodging = true;
    this.isDodgeInvulnerable = true;

    gameStore.setPlayerStats({
      ...gameStore.stats,
      sp: Math.max(0, gameStore.stats.sp - 25),
    });

    soundManager.playSfx('dodge');
    this.player.anims.play(`kael_dodge_${this.currentDirection}`, true);

    // Fast dash impulse
    let dx = 0;
    let dy = 0;
    if (this.currentDirection === 'left') dx = -280;
    else if (this.currentDirection === 'right') dx = 280;
    else if (this.currentDirection === 'up') dy = -280;
    else if (this.currentDirection === 'down') dy = 280;

    this.player.setVelocity(dx, dy);

    // Invulnerability window ends after 250ms, dodge action completes after 350ms
    this.time.delayedCall(250, () => {
      this.isDodgeInvulnerable = false;
    });

    this.time.delayedCall(350, () => {
      this.isDodging = false;
    });
  }

  private performSkill() {
    const gameStore = useGameStore.getState();
    const now = this.time.now;
    if (now - this.lastSkillTime < 2500) return;

    this.lastSkillTime = now;
    const spec = gameStore.specialization;

    if (spec === 'blade_dancer') {
      // Whirlwind Slash
      if (gameStore.stats.sp < 20) return;
      gameStore.setPlayerStats({ ...gameStore.stats, sp: gameStore.stats.sp - 20 });
      soundManager.playSfx('slash');

      const ring = this.add.sprite(this.player.x, this.player.y, 'fx_whirlwind').setDepth(300);
      this.tweens.add({
        targets: ring,
        scale: 1.8,
        alpha: 0,
        duration: 300,
        onComplete: () => ring.destroy(),
      });

      // Hit all enemies within radius 75
      this.enemies.forEach((enemy) => {
        if (enemy.hp <= 0) return;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y);
        if (dist < 75) {
          this.hitEnemy(enemy);
        }
      });
    } else if (spec === 'guardian') {
      // Iron Bastion
      if (gameStore.stats.mp < 10) return;
      gameStore.setPlayerStats({ ...gameStore.stats, mp: gameStore.stats.mp - 10 });
      soundManager.playSfx('crystal');

      this.isDodgeInvulnerable = true;
      const shield = this.add.circle(this.player.x, this.player.y, 28, 0x38bdf8, 0.4).setDepth(300);
      this.tweens.add({
        targets: shield,
        scale: 1.3,
        alpha: 0,
        duration: 1200,
        onComplete: () => {
          this.isDodgeInvulnerable = false;
          shield.destroy();
        },
      });
    } else {
      // Echo Mage: Crystal Lance
      if (gameStore.stats.mp < 25) return;
      gameStore.setPlayerStats({ ...gameStore.stats, mp: gameStore.stats.mp - 25 });
      soundManager.playSfx('crystal');

      const beam = this.add.sprite(this.player.x, this.player.y, 'fx_crystal_beam').setDepth(300);
      let angle = 0;
      if (this.currentDirection === 'left') angle = 180;
      else if (this.currentDirection === 'right') angle = 0;
      else if (this.currentDirection === 'up') angle = -90;
      else if (this.currentDirection === 'down') angle = 90;
      beam.setAngle(angle);

      this.tweens.add({
        targets: beam,
        scaleX: 3,
        alpha: 0,
        duration: 400,
        onComplete: () => beam.destroy(),
      });

      // Pierce line enemies
      this.enemies.forEach((enemy) => {
        if (enemy.hp <= 0) return;
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y);
        if (dist < 150) {
          this.hitEnemy(enemy);
        }
      });
    }
  }

  private handleInteractions() {
    let closestNpc: { id: string; name: string } | null = null;
    let minDist = 48;

    for (const npc of this.npcs) {
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, npc.x, npc.y);
      if (dist < minDist) {
        minDist = dist;
        closestNpc = npc;
      }
    }

    if (closestNpc) {
      this.interactPrompt.setPosition(this.player.x, this.player.y - 28);
      this.interactPrompt.setText(`[E] Talk to ${closestNpc.name}`);
      this.interactPrompt.setVisible(true);

      if (Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        soundManager.playSfx('click');
        useGameStore.getState().setDialogue({
          npcId: closestNpc.id,
          nodeId: `${closestNpc.id}_intro`,
        });
      }
    } else {
      this.interactPrompt.setVisible(false);
    }
  }

  private updateEnemies(_time: number, delta: number) {
    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0 || !enemy.sprite.active) {
        enemy.healthBar.clear();
        return;
      }

      // Update Health Bar above enemy
      enemy.healthBar.clear();
      if (enemy.hp < enemy.maxHp) {
        enemy.healthBar.fillStyle(0x000000, 0.7);
        enemy.healthBar.fillRect(enemy.sprite.x - 12, enemy.sprite.y - 18, 24, 4);
        enemy.healthBar.fillStyle(0xef4444, 1);
        const hpPercent = Math.max(0, enemy.hp / enemy.maxHp);
        enemy.healthBar.fillRect(enemy.sprite.x - 12, enemy.sprite.y - 18, 24 * hpPercent, 4);
      }

      const dist = Phaser.Math.Distance.Between(
        enemy.sprite.x,
        enemy.sprite.y,
        this.player.x,
        this.player.y
      );

      enemy.attackCooldown -= delta;

      // Detection & Chase
      if (dist < 180 && dist > 26) {
        enemy.state = 'chase';
        const angle = Phaser.Math.Angle.Between(
          enemy.sprite.x,
          enemy.sprite.y,
          this.player.x,
          this.player.y
        );
        enemy.sprite.setVelocity(Math.cos(angle) * enemy.speed, Math.sin(angle) * enemy.speed);
      } else if (dist <= 26 && enemy.attackCooldown <= 0) {
        // Attack player!
        enemy.sprite.setVelocity(0, 0);
        enemy.attackCooldown = 1500;
        this.enemyAttackPlayer(enemy);
      } else {
        // Return or wander
        enemy.sprite.setVelocity(0, 0);
      }

      enemy.sprite.setDepth(enemy.sprite.y);
    });
  }

  private enemyAttackPlayer(enemy: EnemyInstance) {
    if (this.isDodgeInvulnerable) {
      return; // Dodge i-frame success!
    }

    const gameStore = useGameStore.getState();
    const dmg = calculateDamage(enemy.attack, gameStore.stats.defense);

    const nextHp = Math.max(0, gameStore.stats.hp - dmg.finalDamage);
    gameStore.setPlayerStats({
      ...gameStore.stats,
      hp: nextHp,
    });

    soundManager.playSfx('hit');
    this.cameras.main.shake(120, 0.008);

    // Red hurt flash
    this.player.setTint(0xff3333);
    this.time.delayedCall(160, () => {
      this.player.clearTint();
    });

    // Player Death check
    if (nextHp <= 0) {
      this.handlePlayerDeath();
    }
  }

  private handlePlayerDeath() {
    this.player.setVelocity(0, 0);
    soundManager.playSfx('hit');
    useGameStore.getState().openModal('gameover');
  }

  private enterDungeon() {
    soundManager.playSfx('crystal');
    this.scene.start('DungeonScene', { tier: 1 });
  }

  respawnPlayer() {
    const gameStore = useGameStore.getState();
    gameStore.setPlayerStats({
      ...gameStore.stats,
      hp: gameStore.stats.maxHp,
      sp: gameStore.stats.maxSp,
    });
    this.player.setPosition(480, 520);
    this.player.setVelocity(0, 0);
    this.player.clearTint();
    gameStore.closeModal();
    gameStore.showNotification('RESPAWNED', 'Restored at the Everlight Village obelisk.', 'info');
  }
}
