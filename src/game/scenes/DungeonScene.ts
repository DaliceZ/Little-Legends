import Phaser from 'phaser';
import { DungeonGenerator, DungeonMap } from '../dungeon/DungeonGenerator';
import { useGameStore } from '../../app/store/useGameStore';
import { calculateDamage } from '../../features/combat/combatCalculations';
import { soundManager } from '../../shared/utils/soundSynthesizer';
import { QuestManager } from '../../features/quests/questManager';
import { LightingManager } from '../rendering/LightingManager';
import { WeatherManager } from '../rendering/WeatherManager';
import { sandboxManager } from '../../features/sandbox/sandboxManager';
import { skillCastingEngine, EnemyTarget } from '../../features/combat/SkillCastingEngine';
import { PetCompanion } from '../entities/PetCompanion';
import { EggDropManager } from '../../features/pets/eggDropManager';

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
  private playerShadow!: Phaser.GameObjects.Ellipse;

  private lightingManager!: LightingManager;
  private weatherManager!: WeatherManager;
  private numKeys: { [key: number]: Phaser.Input.Keyboard.Key } = {};
  private petCompanion: PetCompanion | null = null;
  private currentActivePetId: string | null = null;

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

    // 1. Initialize Lighting & Atmospheric Dust Systems
    this.lightingManager = new LightingManager(this, true);
    this.weatherManager = new WeatherManager(this, true);
    this.weatherManager.setWeather('mist');

    // 2. Render Tiles with Visual Diversity
    for (let y = 0; y < this.dungeonMap.height; y++) {
      for (let x = 0; x < this.dungeonMap.width; x++) {
        const tileType = this.dungeonMap.tiles[y][x];
        const px = x * tileSize + 16;
        const py = y * tileSize + 16;

        if (tileType === 1) {
          // Walkable Floor Variants (clean, cracked, mossy, puddles)
          const hash = (x * 37 + y * 19) % 100;
          let floorKey = 'tile_dungeon_floor';
          if (hash < 12) floorKey = 'tile_dungeon_floor_clean';
          else if (hash < 24) floorKey = 'tile_dungeon_floor_cracked';
          else if (hash < 32) floorKey = 'tile_dungeon_floor_moss';
          else if (hash < 38) floorKey = 'tile_dungeon_floor_puddle';
          this.add.image(px, py, floorKey);
        } else if (tileType === 2) {
          // Solid Wall with Torch Sconces on South-Facing Walls
          const isSouthFloor = y + 1 < this.dungeonMap.height && this.dungeonMap.tiles[y + 1][x] === 1;
          const hash = (x * 31 + y * 17) % 100;
          let wallKey = 'tile_dungeon_wall';

          if (isSouthFloor && hash < 20) {
            wallKey = 'tile_dungeon_wall_torch';
            // Register an atmospheric wall torch point light
            this.lightingManager.addPointLight(px, py + 8, 80, 0xf97316, 0.44, true);
          } else if (hash > 80) {
            wallKey = 'tile_dungeon_wall_cracked';
          }

          this.add.image(px, py, wallKey);
          const wall = this.wallsGroup.create(px, py, undefined);
          wall.setSize(32, 32).setVisible(false);
        } else if (tileType === 3) {
          // Entrance Sanctuary
          this.add.image(px, py, 'tile_dungeon_floor_rune');
          this.add.image(px, py, 'prop_crystal').setScale(0.85);
          this.lightingManager.addPointLight(px, py, 95, 0x38bdf8, 0.5, true);
        } else if (tileType === 4) {
          // Boss Exit Altar
          this.add.image(px, py, 'tile_dungeon_floor_rune');
          this.add.image(px, py, 'prop_dungeon_altar');
          this.lightingManager.addPointLight(px, py, 130, 0xa855f7, 0.55, true);
        }
      }
    }

    // 3. Spawn Player at entrance with Drop Shadow & Crystal Light
    const startX = this.dungeonMap.entrance.x * tileSize + 16;
    const startY = this.dungeonMap.entrance.y * tileSize + 16;

    this.playerShadow = this.add.ellipse(startX, startY + 18, 22, 9, 0x000000, 0.45).setDepth(20);
    this.player = this.physics.add.sprite(startX, startY, 'kael_idle_down');
    this.player.setSize(18, 16).setOffset(12, 30);
    this.player.setCollideWorldBounds(true);
    this.player.setDepth(25);
    this.physics.add.collider(this.player, this.wallsGroup);

    // Attach player Echo crystal light aura
    this.lightingManager.attachPlayerLight(this.player, 0x38bdf8, 110);

    // Setup Camera
    this.cameras.main.setBounds(0, 0, mapW, mapH);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1.5);

    // Controls
    this.setupControls();

    // Spawn Rooms Entities (Braziers, Pillars, Bones, Enemies, Chests)
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
      const rx = room.rect.x * tileSize;
      const ry = room.rect.y * tileSize;
      const rw = room.rect.width * tileSize;

      // 1. Decorative Floor Bone Remnants in combat rooms
      if (room.type === 'combat') {
        const boneX = rx + 48;
        const boneY = ry + 48;
        this.add.image(boneX, boneY, 'prop_dungeon_bones').setDepth(4);
      }

      // 2. Standing Lit Braziers in Treasure and Boss rooms
      if (room.type === 'treasure' || room.type === 'boss') {
        const b1X = rx + 32;
        const b1Y = ry + 32;
        const b2X = rx + rw - 32;
        const b2Y = ry + 32;

        this.add.image(b1X, b1Y, 'prop_brazier_lit').setDepth(b1Y);
        this.lightingManager.addPointLight(b1X, b1Y - 8, 85, 0xf97316, 0.46, true);

        this.add.image(b2X, b2Y, 'prop_brazier_lit').setDepth(b2Y);
        this.lightingManager.addPointLight(b2X, b2Y - 8, 85, 0xf97316, 0.46, true);

        // Center room arcane rune floor marking
        this.add.image(room.center.x * tileSize + 16, room.center.y * tileSize + 16, 'tile_dungeon_floor_rune').setDepth(1);
      }

      // 3. Decorative Stone Pillars in large rooms
      if (room.rect.width >= 10 && room.rect.height >= 10) {
        const p1X = rx + 48;
        const p1Y = ry + 48;
        const p2X = rx + rw - 48;
        const p2Y = ry + 48;
        this.add.image(p1X, p1Y, 'prop_dungeon_pillar').setDepth(p1Y + 16);
        this.add.image(p2X, p2Y, 'prop_dungeon_pillar').setDepth(p2Y + 16);
      }

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

    // Sync player drop shadow
    if (this.playerShadow && this.player && this.player.active) {
      this.playerShadow.setPosition(this.player.x, this.player.y + 18);
    }

    this.handlePlayerInput(time, delta);
    this.handleChestInteractions();
    this.updateEnemies(time, delta);

    // Sync and Update Pet Companion
    this.syncPetCompanion();
    if (this.petCompanion) {
      this.petCompanion.update(time, delta, this.enemies.map(e => ({
        x: e.sprite.x,
        y: e.sprite.y,
        hp: e.hp,
        isDead: e.hp <= 0 || !e.sprite.active,
        takeDamage: (amount, isCrit, _elem) => {
          e.hp -= amount;
          this.showFloatingDamage(e.sprite.x, e.sprite.y - 18, amount, isCrit, '#fbbf24');
          if (e.hp <= 0) this.killEnemy(e);
        }
      })));
    }

    if (this.lightingManager) this.lightingManager.update(time, delta);
    if (this.weatherManager) this.weatherManager.update(time, delta);
  }

  private handlePlayerInput(_time: number, _delta: number) {
    if (this.isAttacking || this.isDodging || skillCastingEngine.getState() !== 'IDLE') return;

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

  public performSkillById(skillId: string) {
    const targets: EnemyTarget[] = this.enemies.map((enemy) => ({
      x: enemy.sprite.x,
      y: enemy.sprite.y,
      hp: enemy.hp,
      defense: enemy.defense,
      type: enemy.type,
      isDead: enemy.hp <= 0 || !enemy.sprite.active,
      sprite: enemy.sprite,
      takeDamage: (amount: number, isCritical: boolean, element: string) => {
        const sandboxCfg = sandboxManager.getConfig();
        if (!sandboxCfg.invulnerableEnemies) {
          enemy.hp -= amount;
        }

        soundManager.playSfx('hit');

        let color = '#ffffff';
        if (element === 'fire') color = '#ef4444';
        else if (element === 'ice') color = '#38bdf8';
        else if (element === 'shadow') color = '#c084fc';
        else if (element === 'crystal') color = '#67e8f9';
        else if (element === 'earth') color = '#f59e0b';
        else if (element === 'wind') color = '#a7f3d0';

        this.showFloatingDamage(enemy.sprite.x, enemy.sprite.y - 18, amount, isCritical, color);

        sandboxManager.recordDamage(skillId, enemy.type, amount, isCritical, element);

        enemy.sprite.setTint(0xff5555);
        this.time.delayedCall(160, () => {
          if (enemy.sprite.active) enemy.sprite.clearTint();
        });

        if (enemy.hp <= 0 && !sandboxCfg.invulnerableEnemies) {
          this.killEnemy(enemy);
        }
      },
    }));

    skillCastingEngine.castSkill(skillId, {
      scene: this,
      player: this.player,
      currentDirection: this.currentDirection,
      getEnemies: () => targets,
      setInvulnerable: (invuln: boolean) => {
        this.isDodgeInvulnerable = invuln;
      },
    });
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

      // Pet Boss EXP & Guaranteed Legendary/Epic Egg Drop
      if (this.petCompanion) {
        this.petCompanion.gainExp(250);
      }
      const bossEgg = EggDropManager.rollEggDrop(true, true);
      if (bossEgg) {
        useGameStore.getState().addEgg(bossEgg.rarity, bossEgg.speciesId);
      }

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

      // Pet EXP & Dungeon Egg Drop
      if (this.petCompanion) {
        this.petCompanion.gainExp(Math.round(exp * 0.8));
      }
      const normalEgg = EggDropManager.rollEggDrop(true, false);
      if (normalEgg) {
        useGameStore.getState().addEgg(normalEgg.rarity, normalEgg.speciesId);
      }
    }

    this.tweens.add({
      targets: enemy.sprite,
      alpha: 0,
      duration: 300,
      onComplete: () => enemy.sprite.destroy(),
    });
  }

  private syncPetCompanion() {
    const gameStore = useGameStore.getState();
    const activePetId = gameStore.activePetId;

    if (activePetId !== this.currentActivePetId) {
      this.currentActivePetId = activePetId;
      if (this.petCompanion) {
        this.petCompanion.destroy();
        this.petCompanion = null;
      }

      if (activePetId) {
        const petData = gameStore.pets.find((p) => p.id === activePetId);
        if (petData && this.player) {
          this.petCompanion = new PetCompanion(
            this,
            this.player.x,
            this.player.y,
            petData,
            this.player
          );
        }
      }
    }
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
