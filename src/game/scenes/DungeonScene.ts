import Phaser from 'phaser';
import { DungeonGenerator, DungeonMap } from '../dungeon/DungeonGenerator';
import { useGameStore } from '../../app/store/useGameStore';
import { calculateDamage } from '../../features/combat/combatCalculations';
import { soundManager } from '../../shared/utils/soundSynthesizer';
import { QuestManager } from '../../features/quests/questManager';
import { LightingManager } from '../rendering/LightingManager';
import { WeatherManager } from '../rendering/WeatherManager';
import { VFXManager } from '../rendering/VFXManager';
import { ALL_SKILLS_36 } from '../../features/skills/skillData';
import { sandboxManager } from '../../features/sandbox/sandboxManager';

interface DungeonEnemy {
  sprite: Phaser.Physics.Arcade.Sprite;
  type: 'slime' | 'bat' | 'wolf' | 'mushroom' | 'golem';
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  attackCooldown: number;
  isBoss?: boolean;
}

interface DungeonChest {
  sprite: Phaser.GameObjects.Sprite;
  opened: boolean;
  x: number;
  y: number;
}

export class DungeonScene extends Phaser.Scene {
  private dungeonMap!: DungeonMap;
  private tier: number = 1;
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
  private lastAttackTime: number = 0;

  private enemies: DungeonEnemy[] = [];
  private chests: DungeonChest[] = [];
  private wallsGroup!: Phaser.Physics.Arcade.StaticGroup;

  private lightingManager!: LightingManager;
  private weatherManager!: WeatherManager;
  private numKeys: { [key: number]: Phaser.Input.Keyboard.Key } = {};
  private skillCooldowns: Map<string, number> = new Map();

  constructor() {
    super({ key: 'DungeonScene' });
  }

  init(data: { tier?: number; seed?: number }) {
    this.tier = data.tier || 1;
    const seed = data.seed || Math.floor(Math.random() * 999999);
    this.dungeonMap = DungeonGenerator.generate(seed, this.tier);
    this.enemies = [];
    this.chests = [];
  }

  create() {
    const tileSize = 32;
    const mapW = this.dungeonMap.width * tileSize;
    const mapH = this.dungeonMap.height * tileSize;
    this.physics.world.setBounds(0, 0, mapW, mapH);

    this.wallsGroup = this.physics.add.staticGroup();

    // Render Tiles
    for (let y = 0; y < this.dungeonMap.height; y++) {
      for (let x = 0; x < this.dungeonMap.width; x++) {
        const tileType = this.dungeonMap.tiles[y][x];
        const px = x * tileSize + 16;
        const py = y * tileSize + 16;

        if (tileType === 1) {
          // Walkable Floor
          this.add.image(px, py, 'tile_dungeon_floor');
        } else if (tileType === 2) {
          // Solid Wall
          this.add.image(px, py, 'tile_dungeon_wall');
          const wall = this.wallsGroup.create(px, py, undefined);
          wall.setSize(32, 32).setVisible(false);
        } else if (tileType === 3) {
          // Entrance
          this.add.image(px, py, 'tile_dungeon_floor');
          this.add.image(px, py, 'prop_crystal').setScale(0.8);
        } else if (tileType === 4) {
          // Boss Exit Altar
          this.add.image(px, py, 'tile_dungeon_floor');
          this.add.image(px, py, 'prop_crystal').setScale(1.2);
        }
      }
    }

    // Spawn Player at entrance
    const startX = this.dungeonMap.entrance.x * tileSize + 16;
    const startY = this.dungeonMap.entrance.y * tileSize + 16;
    this.player = this.physics.add.sprite(startX, startY, 'kael_idle_down');
    this.player.setSize(18, 16).setOffset(12, 30);
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.wallsGroup);

    // Setup Camera
    this.cameras.main.setBounds(0, 0, mapW, mapH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // Controls
    this.setupControls();

    // Spawn Rooms Entities (Enemies, Chests)
    this.spawnDungeonEntities(tileSize);

    // Exit portal overlap (returns to village)
    const exitX = this.dungeonMap.bossPortal.x * tileSize + 16;
    const exitY = this.dungeonMap.bossPortal.y * tileSize + 16;
    const exitPortal = this.physics.add.staticSprite(exitX, exitY, 'prop_crystal');
    exitPortal.setSize(48, 48).setVisible(false);
    this.physics.add.overlap(this.player, exitPortal, () => {
      this.returnToVillage();
    });

    // Notify React zone
    useGameStore.getState().setZone('dungeon', this.tier);
    soundManager.playMusic('dungeon');
    useGameStore.getState().showNotification(
      'ENTERED DUNGEON',
      `Endless Echo Ruins (Tier ${this.tier})`,
      'info'
    );

    // Lighting & Mist Weather Systems
    this.lightingManager = new LightingManager(this, true);
    this.weatherManager = new WeatherManager(this, true);
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

    this.numKeys = {
      1: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      2: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      3: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      4: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      5: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
      6: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SIX),
    };

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.leftButtonDown()) {
        this.performAttack();
      }
    });
  }

  private spawnDungeonEntities(tileSize: number) {
    for (const room of this.dungeonMap.rooms) {
      // Spawn Chests
      if (room.chestSpawn) {
        const cx = room.chestSpawn.x * tileSize + 16;
        const cy = room.chestSpawn.y * tileSize + 16;
        const chestSprite = this.add.sprite(cx, cy, 'prop_chest');
        this.chests.push({
          sprite: chestSprite,
          opened: false,
          x: cx,
          y: cy,
        });
      }

      // Spawn Enemies
      for (const e of room.enemySpawns) {
        const ex = e.x * tileSize + 16;
        const ey = e.y * tileSize + 16;
        const isBoss = e.type === 'golem';

        const sprite = this.physics.add.sprite(
          ex,
          ey,
          isBoss ? 'boss_golem' : `enemy_${e.type}`
        );
        sprite.setSize(isBoss ? 44 : 20, isBoss ? 44 : 18);
        sprite.setCollideWorldBounds(true);
        this.physics.add.collider(sprite, this.wallsGroup);

        const tierScaling = 1 + (this.tier - 1) * 0.35;
        const maxHp = Math.round((isBoss ? 450 : e.type === 'mushroom' ? 85 : 40) * tierScaling);
        const attack = Math.round((isBoss ? 28 : e.type === 'mushroom' ? 18 : 12) * tierScaling);
        const defense = Math.round((isBoss ? 12 : 5) * tierScaling);
        const speed = isBoss ? 55 : 85;

        const enemyInst: DungeonEnemy = {
          sprite,
          type: e.type,
          hp: maxHp,
          maxHp,
          attack,
          defense,
          speed,
          attackCooldown: 0,
          isBoss,
        };

        this.enemies.push(enemyInst);
      }
    }
  }

  update(time: number, delta: number) {
    const gameStore = useGameStore.getState();
    const isPaused = gameStore.activeModal !== 'none' || gameStore.currentDialogue !== null;
    if (isPaused) {
      this.player.setVelocity(0, 0);
      return;
    }

    this.handlePlayerInput(time, delta);
    this.handleChestInteractions();
    this.updateEnemies(time, delta);

    if (this.lightingManager) this.lightingManager.update(time, delta);
    if (this.weatherManager) this.weatherManager.update(time, delta);
  }

  private handlePlayerInput(_time: number, _delta: number) {
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
    const speedMult = isSprinting ? 1.4 : 1.0;
    const baseSpeed = gameStore.stats.speed;

    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071;
      vy *= 0.7071;
    }

    this.player.setVelocity(vx * baseSpeed * speedMult, vy * baseSpeed * speedMult);

    if (vx < 0) this.currentDirection = 'left';
    else if (vx > 0) this.currentDirection = 'right';
    else if (vy < 0) this.currentDirection = 'up';
    else if (vy > 0) this.currentDirection = 'down';

    if (vx !== 0 || vy !== 0) {
      this.player.anims.play(`kael_walk_${this.currentDirection}`, true);
    } else {
      this.player.anims.stop();
      this.player.setTexture(`kael_idle_${this.currentDirection}`);
    }

    this.player.setDepth(this.player.y);

    if (Phaser.Input.Keyboard.JustDown(this.attackKey)) {
      this.performAttack();
    } else if (Phaser.Input.Keyboard.JustDown(this.dodgeKey)) {
      this.performDodge();
    } else {
      for (let i = 1; i <= 6; i++) {
        if (this.numKeys[i] && Phaser.Input.Keyboard.JustDown(this.numKeys[i])) {
          this.triggerHotbarSlot(i - 1);
          break;
        }
      }
      if (Phaser.Input.Keyboard.JustDown(this.skillKey)) {
        this.triggerHotbarSlot(0);
      }
    }
  }

  private performAttack() {
    const gameStore = useGameStore.getState();
    const now = this.time.now;
    if (now - this.lastAttackTime < 320) return;
    if (gameStore.stats.sp < 10) return;

    this.lastAttackTime = now;
    this.isAttacking = true;
    this.player.setVelocity(0, 0);

    gameStore.setPlayerStats({
      ...gameStore.stats,
      sp: Math.max(0, gameStore.stats.sp - 10),
    });

    this.player.anims.play(`kael_attack_${this.currentDirection}`, true);
    soundManager.playSfx('slash');

    let slashX = this.player.x;
    let slashY = this.player.y;
    let angle = 0;
    if (this.currentDirection === 'right') {
      slashX += 24;
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
      scale: 1.3,
      duration: 180,
      onComplete: () => slashFx.destroy(),
    });

    // Check hit against dungeon enemies
    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0) return;
      const dist = Phaser.Math.Distance.Between(slashX, slashY, enemy.sprite.x, enemy.sprite.y);
      if (dist < (enemy.isBoss ? 56 : 42)) {
        this.hitEnemy(enemy);
      }
    });

    this.time.delayedCall(250, () => {
      this.isAttacking = false;
    });
  }

  private triggerHotbarSlot(slotIndex: number) {
    const hotbar = useGameStore.getState().hotbar;
    const skillId = hotbar[slotIndex];
    if (!skillId) return;
    this.performSkillById(skillId);
  }

  private performSkillById(skillId: string) {
    const gameStore = useGameStore.getState();
    const skill = ALL_SKILLS_36[skillId];
    if (!skill) return;

    const now = this.time.now;
    const sandboxCfg = sandboxManager.getConfig();

    if (!sandboxCfg.zeroCooldowns && now < (this.skillCooldowns.get(skillId) || 0)) {
      return;
    }

    if (!sandboxCfg.infiniteStamina && (skill.costSp || 0) > gameStore.stats.sp) {
      gameStore.showNotification('LOW STAMINA', 'Not enough stamina!', 'warning');
      return;
    }
    if (!sandboxCfg.infiniteMana && (skill.costMp || 0) > gameStore.stats.mp) {
      gameStore.showNotification('LOW MANA', 'Not enough mana!', 'warning');
      return;
    }

    if (!sandboxCfg.infiniteStamina && skill.costSp) {
      gameStore.setPlayerStats({
        ...gameStore.stats,
        sp: Math.max(0, gameStore.stats.sp - skill.costSp),
      });
    }
    if (!sandboxCfg.infiniteMana && skill.costMp) {
      gameStore.setPlayerStats({
        ...gameStore.stats,
        mp: Math.max(0, gameStore.stats.mp - skill.costMp),
      });
    }

    this.skillCooldowns.set(skillId, now + skill.cooldownMs);

    let targetX = this.player.x;
    let targetY = this.player.y;
    let angle = 0;

    if (this.currentDirection === 'right') {
      targetX += 36;
      angle = 0;
    } else if (this.currentDirection === 'left') {
      targetX -= 36;
      angle = 180;
    } else if (this.currentDirection === 'down') {
      targetY += 36;
      angle = 90;
    } else {
      targetY -= 36;
      angle = -90;
    }

    soundManager.playSfx(skill.element as any || 'slash');
    VFXManager.playEffect(this, (skill.element as any) || 'crystal', targetX, targetY, angle);

    if (skill.id === 'skill_bd_phantom_cut') {
      let nearest: DungeonEnemy | null = null;
      let minDist = 300;
      for (const e of this.enemies) {
        if (e.hp > 0 && e.sprite.active) {
          const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.sprite.x, e.sprite.y);
          if (d < minDist) {
            minDist = d;
            nearest = e;
          }
        }
      }
      if (nearest) {
        this.player.setPosition(nearest.sprite.x - 24, nearest.sprite.y);
      }
    } else if (skill.id === 'skill_fm_blink') {
      const blinkDist = 110;
      if (this.currentDirection === 'right') this.player.x += blinkDist;
      else if (this.currentDirection === 'left') this.player.x -= blinkDist;
      else if (this.currentDirection === 'down') this.player.y += blinkDist;
      else if (this.currentDirection === 'up') this.player.y -= blinkDist;
    }

    if (skill.id === 'skill_gd_unbreakable_wall' || skill.id === 'skill_bd_dash_strike') {
      this.isDodgeInvulnerable = true;
      this.time.delayedCall(800, () => {
        this.isDodgeInvulnerable = false;
      });
    }

    const range = skill.range || 85;
    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0 || !enemy.sprite.active) return;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.sprite.x, enemy.sprite.y);
      if (dist <= range) {
        this.hitEnemyWithSkill(enemy, skill);
      }
    });
  }

  private hitEnemyWithSkill(enemy: DungeonEnemy, skill: any) {
    const gameStore = useGameStore.getState();
    const sandboxCfg = sandboxManager.getConfig();

    const effectiveAtk = Math.round(gameStore.stats.attack * skill.damageMultiplier);
    const dmg = calculateDamage(
      effectiveAtk,
      enemy.defense,
      gameStore.stats.critChance + (skill.isUltimate ? 0.35 : 0),
      gameStore.stats.critDamage
    );

    if (!sandboxCfg.invulnerableEnemies) {
      enemy.hp -= dmg.finalDamage;
    }

    soundManager.playSfx('hit');

    let color = '#ffffff';
    if (skill.element === 'fire') color = '#ef4444';
    else if (skill.element === 'ice') color = '#38bdf8';
    else if (skill.element === 'shadow') color = '#c084fc';
    else if (skill.element === 'crystal') color = '#67e8f9';
    else if (skill.element === 'earth') color = '#f59e0b';
    else if (skill.element === 'wind') color = '#a7f3d0';

    this.showFloatingDamage(enemy.sprite.x, enemy.sprite.y - 18, dmg.finalDamage, dmg.isCritical, color);

    sandboxManager.recordDamage(skill.nameEn, enemy.type, dmg.finalDamage, dmg.isCritical, skill.element);

    enemy.sprite.setTint(0xff5555);
    this.time.delayedCall(160, () => {
      if (enemy.sprite.active) enemy.sprite.clearTint();
    });

    if (enemy.hp <= 0 && !sandboxCfg.invulnerableEnemies) {
      this.killEnemy(enemy);
    }
  }

  private showFloatingDamage(x: number, y: number, amount: number, isCrit: boolean, color?: string) {
    const text = this.add.text(
      x,
      y,
      isCrit ? `CRIT! -${amount}` : `-${amount}`,
      {
        fontSize: isCrit ? '15px' : '11px',
        color: isCrit ? '#fbbf24' : (color || '#ffffff'),
        stroke: '#000000',
        strokeThickness: 3,
      }
    ).setOrigin(0.5).setDepth(400);

    this.tweens.add({
      targets: text,
      y: y - 24,
      alpha: 0,
      duration: 600,
      onComplete: () => text.destroy(),
    });
  }

  private hitEnemy(enemy: DungeonEnemy) {
    const gameStore = useGameStore.getState();
    const sandboxCfg = sandboxManager.getConfig();

    const dmg = calculateDamage(
      gameStore.stats.attack,
      enemy.defense,
      gameStore.stats.critChance,
      gameStore.stats.critDamage
    );

    if (!sandboxCfg.invulnerableEnemies) {
      enemy.hp -= dmg.finalDamage;
    }

    soundManager.playSfx('hit');

    this.showFloatingDamage(enemy.sprite.x, enemy.sprite.y - 18, dmg.finalDamage, dmg.isCritical);

    sandboxManager.recordDamage('Basic Slash', enemy.type, dmg.finalDamage, dmg.isCritical, 'physical');

    enemy.sprite.setTint(0xff5555);
    this.time.delayedCall(160, () => {
      if (enemy.sprite.active) enemy.sprite.clearTint();
    });

    if (enemy.hp <= 0 && !sandboxCfg.invulnerableEnemies) {
      this.killEnemy(enemy);
    }
  }

  private killEnemy(enemy: DungeonEnemy) {
    if (enemy.isBoss) {
      soundManager.playSfx('crystal');
      useGameStore.getState().updateExpAndGold(400, 200, 3);
      useGameStore.getState().addItemToInventory('item_golem_core', 1);

      // Quest kill
      const curQuests = useGameStore.getState().quests;
      const { updatedQuests } = QuestManager.recordKill(curQuests, 'golem');
      useGameStore.getState().setQuests(updatedQuests);

      useGameStore.getState().showNotification(
        'BOSS DEFEATED!',
        'Ancient Golem has collapsed! Collect your spoils.',
        'success'
      );
    } else {
      const exp = enemy.type === 'mushroom' ? 60 : 35;
      useGameStore.getState().updateExpAndGold(exp, 12);
      if (enemy.type === 'mushroom') {
        useGameStore.getState().addItemToInventory('item_spore_cap', 1);
      }
    }

    this.tweens.add({
      targets: enemy.sprite,
      alpha: 0,
      duration: 300,
      onComplete: () => enemy.sprite.destroy(),
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

    let dx = 0;
    let dy = 0;
    if (this.currentDirection === 'left') dx = -280;
    else if (this.currentDirection === 'right') dx = 280;
    else if (this.currentDirection === 'up') dy = -280;
    else if (this.currentDirection === 'down') dy = 280;

    this.player.setVelocity(dx, dy);

    this.time.delayedCall(250, () => {
      this.isDodgeInvulnerable = false;
    });
    this.time.delayedCall(350, () => {
      this.isDodging = false;
    });
  }

  private handleChestInteractions() {
    for (const chest of this.chests) {
      if (chest.opened) continue;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y);
      if (dist < 40 && Phaser.Input.Keyboard.JustDown(this.interactKey)) {
        chest.opened = true;
        soundManager.playSfx('pickup');

        // Grant loot
        useGameStore.getState().updateExpAndGold(50, 45, 1);
        useGameStore.getState().addItemToInventory('item_health_potion', 2);
        useGameStore.getState().showNotification('CHEST OPENED', 'Found: 45 Gold, 2 Health Potions!', 'loot');

        // Visual opened chest tint
        chest.sprite.setTint(0xfef08a);
      }
    }
  }

  private updateEnemies(_time: number, delta: number) {
    if (sandboxManager.getConfig().disableEnemyAI) {
      this.enemies.forEach((enemy) => {
        if (enemy.sprite.active) enemy.sprite.setVelocity(0, 0);
      });
      return;
    }

    this.enemies.forEach((enemy) => {
      if (enemy.hp <= 0 || !enemy.sprite.active) return;

      const dist = Phaser.Math.Distance.Between(
        enemy.sprite.x,
        enemy.sprite.y,
        this.player.x,
        this.player.y
      );

      enemy.attackCooldown -= delta;

      if (dist < 220 && dist > (enemy.isBoss ? 45 : 26)) {
        const angle = Phaser.Math.Angle.Between(
          enemy.sprite.x,
          enemy.sprite.y,
          this.player.x,
          this.player.y
        );
        enemy.sprite.setVelocity(Math.cos(angle) * enemy.speed, Math.sin(angle) * enemy.speed);
      } else if (dist <= (enemy.isBoss ? 45 : 26) && enemy.attackCooldown <= 0) {
        enemy.sprite.setVelocity(0, 0);
        enemy.attackCooldown = enemy.isBoss ? 2200 : 1500;
        this.enemyAttackPlayer(enemy);
      } else {
        enemy.sprite.setVelocity(0, 0);
      }

      enemy.sprite.setDepth(enemy.sprite.y);
    });
  }

  private enemyAttackPlayer(enemy: DungeonEnemy) {
    if (this.isDodgeInvulnerable || sandboxManager.getConfig().godMode) return;

    if (enemy.isBoss) {
      // Boss Telegraphed Attack: Ground Slam!
      soundManager.playSfx('boss_roar');
      const slamIndicator = this.add.circle(this.player.x, this.player.y, 48, 0xef4444, 0.4).setDepth(200);

      this.time.delayedCall(500, () => {
        slamIndicator.destroy();
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, slamIndicator.x, slamIndicator.y);
        if (dist < 48 && !this.isDodgeInvulnerable) {
          const gameStore = useGameStore.getState();
          const dmg = calculateDamage(enemy.attack * 1.3, gameStore.stats.defense);
          const nextHp = Math.max(0, gameStore.stats.hp - dmg.finalDamage);
          gameStore.setPlayerStats({ ...gameStore.stats, hp: nextHp });
          this.cameras.main.shake(200, 0.015);
          soundManager.playSfx('hit');

          if (nextHp <= 0) {
            useGameStore.getState().openModal('gameover');
          }
        }
      });
    } else {
      const gameStore = useGameStore.getState();
      const dmg = calculateDamage(enemy.attack, gameStore.stats.defense);
      const nextHp = Math.max(0, gameStore.stats.hp - dmg.finalDamage);
      gameStore.setPlayerStats({ ...gameStore.stats, hp: nextHp });
      soundManager.playSfx('hit');
      this.cameras.main.shake(100, 0.007);

      if (nextHp <= 0) {
        useGameStore.getState().openModal('gameover');
      }
    }
  }

  private returnToVillage() {
    soundManager.playSfx('crystal');
    useGameStore.getState().showNotification('RETURNED SAFELY', 'Back in Everlight Village.', 'info');
    this.scene.start('WorldScene');
  }
}
