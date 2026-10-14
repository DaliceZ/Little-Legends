import Phaser from 'phaser';
import { ALL_SKILLS_36 } from '../skills/skillData';
import { SkillNode } from '../../shared/types';
import { useGameStore } from '../../app/store/useGameStore';
import { sandboxManager } from '../sandbox/sandboxManager';
import { soundManager } from '../../shared/utils/soundSynthesizer';
import { VFXManager } from '../../game/rendering/VFXManager';
import { calculateDamage } from './combatCalculations';

export type SkillCastState = 
  | 'IDLE'
  | 'CAST_START'
  | 'CASTING'
  | 'IMPACT'
  | 'RECOVERY'
  | 'CANCELLED';

export interface EnemyTarget {
  x: number;
  y: number;
  hp: number;
  defense?: number;
  type: string;
  isDead?: boolean;
  takeDamage: (amount: number, isCritical: boolean, element: string) => void;
  sprite: Phaser.GameObjects.Sprite | Phaser.Physics.Arcade.Sprite;
}

export interface SkillCastContext {
  scene: Phaser.Scene;
  player: Phaser.Physics.Arcade.Sprite;
  currentDirection: 'left' | 'right' | 'up' | 'down';
  getEnemies: () => EnemyTarget[];
  onStateChange?: (state: SkillCastState, skillId: string | null) => void;
  setInvulnerable?: (invuln: boolean) => void;
}

export class SkillCastingEngine {
  private static instance: SkillCastingEngine | null = null;

  private state: SkillCastState = 'IDLE';
  private currentSkillId: string | null = null;
  private currentContext: SkillCastContext | null = null;
  private cooldowns: Map<string, number> = new Map();
  private maxCooldowns: Map<string, number> = new Map();
  private activeTimers: Phaser.Time.TimerEvent[] = [];
  private activeTweens: Phaser.Tweens.Tween[] = [];
  private costDeducted: boolean = false;

  public static getInstance(): SkillCastingEngine {
    if (!SkillCastingEngine.instance) {
      SkillCastingEngine.instance = new SkillCastingEngine();
    }
    return SkillCastingEngine.instance;
  }

  public getState(): SkillCastState {
    return this.state;
  }

  public getCurrentSkill(): SkillNode | null {
    if (!this.currentSkillId) return null;
    return ALL_SKILLS_36[this.currentSkillId] || null;
  }

  public getCooldownRemaining(skillId: string, now: number = Date.now()): number {
    const sandboxCfg = sandboxManager.getConfig();
    if (sandboxCfg.zeroCooldowns) return 0;
    const expiresAt = this.cooldowns.get(skillId) || 0;
    return Math.max(0, expiresAt - now);
  }

  public getCooldownRatio(skillId: string, now: number = Date.now()): number {
    const remaining = this.getCooldownRemaining(skillId, now);
    if (remaining <= 0) return 0;
    const max = this.maxCooldowns.get(skillId) || 1;
    return Math.min(1, remaining / max);
  }

  public resetAllCooldowns(): void {
    this.cooldowns.clear();
    this.maxCooldowns.clear();
  }

  public canCast(skillId: string, _context?: SkillCastContext): { canCast: boolean; reason?: string } {
    if (this.state !== 'IDLE') {
      return { canCast: false, reason: 'Already casting another skill' };
    }

    const skill = ALL_SKILLS_36[skillId];
    if (!skill) {
      return { canCast: false, reason: 'Skill not found' };
    }

    const now = Date.now();
    const remainingCd = this.getCooldownRemaining(skillId, now);
    if (remainingCd > 0) {
      return { canCast: false, reason: `Skill on cooldown (${Math.ceil(remainingCd / 1000)}s)` };
    }

    const gameStore = useGameStore.getState();
    const sandboxCfg = sandboxManager.getConfig();

    // Check if player is alive
    if (gameStore.stats.hp <= 0) {
      return { canCast: false, reason: 'Player is defeated' };
    }

    // Check if modal or dialogue is active
    if (gameStore.activeModal !== 'none' || gameStore.currentDialogue !== null) {
      return { canCast: false, reason: 'Cannot cast while in menu or dialogue' };
    }

    // SP cost check
    if (!sandboxCfg.infiniteStamina && (skill.costSp || 0) > gameStore.stats.sp) {
      return { canCast: false, reason: 'Not enough stamina' };
    }

    // MP cost check
    if (!sandboxCfg.infiniteMana && (skill.costMp || 0) > gameStore.stats.mp) {
      return { canCast: false, reason: 'Not enough mana' };
    }

    return { canCast: true };
  }

  public castSkill(skillId: string, context: SkillCastContext): boolean {
    const validation = this.canCast(skillId, context);
    if (!validation.canCast) {
      const gameStore = useGameStore.getState();
      if (validation.reason?.includes('mana')) {
        gameStore.showNotification('LOW MANA', validation.reason, 'warning');
      } else if (validation.reason?.includes('stamina')) {
        gameStore.showNotification('LOW STAMINA', validation.reason, 'warning');
      }
      return false;
    }

    const skill = ALL_SKILLS_36[skillId];
    this.currentSkillId = skillId;
    this.currentContext = context;
    this.costDeducted = false;

    // Start Casting Pipeline
    this.enterState('CAST_START');

    const scene = context.scene;
    const player = context.player;
    const dir = context.currentDirection;

    // Halt movement during skill execution
    player.setVelocity(0, 0);

    // ==========================================
    // STAGE 1: WIND-UP (CAST_START)
    // ==========================================
    const windUpDuration = skill.isUltimate ? 240 : 120;

    // Wind-up visual: squash & stretch and elemental glow
    const elemColor = this.getElementColorHex(skill.element || 'physical');
    player.setTint(elemColor);

    const windUpTween = scene.tweens.add({
      targets: player,
      scaleX: 1.15,
      scaleY: 0.88,
      duration: windUpDuration,
      ease: 'Quad.easeInOut',
      yoyo: true,
      onComplete: () => {
        // Check if cancelled during windup
        if (this.state !== 'CAST_START') return;

        // ==========================================
        // STAGE 2: TRAVEL / EXECUTION (CASTING)
        // ==========================================
        this.enterState('CASTING');

        // Play directional attack/skill animation
        const animKey = `kael_attack_${dir}`;
        if (player.anims && player.anims.exists(animKey)) {
          player.anims.play(animKey, true);
        }

        // Special movement abilities (Dashes / Teleports)
        this.handleMovementMechanics(skill, context);

        const executionDuration = skill.isUltimate ? 200 : 100;
        const execTimer = scene.time.delayedCall(executionDuration, () => {
          if (this.state !== 'CASTING') return;

          // ==========================================
          // STAGE 3: IMPACT (VFX, Hit, Resources, CD)
          // ==========================================
          this.executeImpact(skill, context);

          // ==========================================
          // STAGE 4: RECOVERY
          // ==========================================
          this.enterState('RECOVERY');
          const recoveryDuration = 100;

          const recTimer = scene.time.delayedCall(recoveryDuration, () => {
            if (this.state !== 'RECOVERY') return;

            // ==========================================
            // STAGE 5: RETURN TO IDLE
            // ==========================================
            this.finishCast();
          });
          this.activeTimers.push(recTimer);
        });
        this.activeTimers.push(execTimer);
      },
    });
    this.activeTweens.push(windUpTween);

    return true;
  }

  private executeImpact(skill: SkillNode, context: SkillCastContext): void {
    this.enterState('IMPACT');
    const { scene, player, currentDirection } = context;
    const gameStore = useGameStore.getState();
    const sandboxCfg = sandboxManager.getConfig();

    // 1. Commit resources
    if (!this.costDeducted) {
      this.costDeducted = true;
      let newSp = gameStore.stats.sp;
      let newMp = gameStore.stats.mp;

      if (!sandboxCfg.infiniteStamina && skill.costSp) {
        newSp = Math.max(0, newSp - skill.costSp);
      }
      if (!sandboxCfg.infiniteMana && skill.costMp) {
        newMp = Math.max(0, newMp - skill.costMp);
      }

      gameStore.setPlayerStats({
        ...gameStore.stats,
        sp: newSp,
        mp: newMp,
      });
    }

    // 2. Commit cooldown
    const now = Date.now();
    const finalCooldown = sandboxCfg.zeroCooldowns ? 0 : skill.cooldownMs;
    this.cooldowns.set(skill.id, now + finalCooldown);
    this.maxCooldowns.set(skill.id, finalCooldown);

    // 3. Directional offset for VFX
    let targetX = player.x;
    let targetY = player.y;
    let angle = 0;

    if (currentDirection === 'right') {
      targetX += 36;
      angle = 0;
    } else if (currentDirection === 'left') {
      targetX -= 36;
      angle = 180;
    } else if (currentDirection === 'down') {
      targetY += 36;
      angle = 90;
    } else {
      targetY -= 36;
      angle = -90;
    }

    // 4. Play audio & VFX
    soundManager.playSfx((skill.element as any) || 'slash');
    VFXManager.playEffect(scene, (skill.element as any) || 'crystal', targetX, targetY, angle);

    // Ultimate screen shake
    if (skill.isUltimate) {
      scene.cameras.main.shake(200, 0.015);
    }

    // 5. Hit detection on enemies
    const range = skill.range || 85;
    const enemies = context.getEnemies();

    enemies.forEach((enemy) => {
      if (enemy.isDead || enemy.hp <= 0 || !enemy.sprite.active) return;
      const dist = Phaser.Math.Distance.Between(player.x, player.y, enemy.sprite.x, enemy.sprite.y);
      if (dist <= range) {
        this.hitEnemy(enemy, skill);
      }
    });
  }

  private hitEnemy(enemy: EnemyTarget, skill: SkillNode): void {
    const gameStore = useGameStore.getState();
    const effectiveAtk = Math.round(gameStore.stats.attack * (skill.damageMultiplier ?? 1.0));
    const dmg = calculateDamage(
      effectiveAtk,
      enemy.defense || 2,
      gameStore.stats.critChance + (skill.isUltimate ? 0.35 : 0),
      gameStore.stats.critDamage
    );

    const elem = skill.element || 'physical';
    enemy.takeDamage(dmg.finalDamage, dmg.isCritical, elem);
    sandboxManager.recordDamage(skill.nameEn, enemy.type, dmg.finalDamage, dmg.isCritical, elem);
  }

  private handleMovementMechanics(skill: SkillNode, context: SkillCastContext): void {
    const { player, currentDirection, setInvulnerable } = context;

    // Phantom Cut: Teleport behind nearest enemy
    if (skill.id === 'skill_bd_phantom_cut') {
      const enemies = context.getEnemies();
      let nearest: EnemyTarget | null = null;
      let minDist = 320;
      for (const e of enemies) {
        if (!e.isDead && e.hp > 0 && e.sprite.active) {
          const d = Phaser.Math.Distance.Between(player.x, player.y, e.sprite.x, e.sprite.y);
          if (d < minDist) {
            minDist = d;
            nearest = e;
          }
        }
      }
      if (nearest) {
        player.setPosition(nearest.sprite.x - (currentDirection === 'left' ? -28 : 28), nearest.sprite.y);
      }
    } 
    // Blink: Instant forward dash
    else if (skill.id === 'skill_fm_blink') {
      const blinkDist = 120;
      if (currentDirection === 'right') player.x += blinkDist;
      else if (currentDirection === 'left') player.x -= blinkDist;
      else if (currentDirection === 'down') player.y += blinkDist;
      else if (currentDirection === 'up') player.y -= blinkDist;
    }

    // Invulnerability buff on defensive skills
    if (skill.id === 'skill_gd_unbreakable_wall' || skill.id === 'skill_bd_dash_strike') {
      if (setInvulnerable) {
        setInvulnerable(true);
        context.scene.time.delayedCall(800, () => {
          setInvulnerable(false);
        });
      }
    }
  }

  public cancelCurrentCast(_reason: string = 'Interrupted', _refundResources: boolean = true): void {
    if (this.state === 'IDLE' || this.state === 'CANCELLED') return;

    this.enterState('CANCELLED');

    // Clean up active timers & tweens
    this.activeTimers.forEach((t) => t.remove(false));
    this.activeTimers = [];
    this.activeTweens.forEach((tw) => tw.stop());
    this.activeTweens = [];

    // Reset player visual state
    if (this.currentContext && this.currentContext.player) {
      this.currentContext.player.clearTint();
      this.currentContext.player.setScale(1, 1);
    }

    // Refund resources if interrupted before impact was executed
    if (!this.costDeducted && _refundResources) {
      // Nothing was deducted yet, safe!
    }

    this.currentSkillId = null;
    this.currentContext = null;
    this.enterState('IDLE');
  }

  private finishCast(): void {
    if (this.currentContext && this.currentContext.player) {
      this.currentContext.player.clearTint();
      this.currentContext.player.setScale(1, 1);
    }
    this.currentSkillId = null;
    this.currentContext = null;
    this.enterState('IDLE');
  }

  private enterState(nextState: SkillCastState): void {
    this.state = nextState;
    if (this.currentContext?.onStateChange) {
      this.currentContext.onStateChange(nextState, this.currentSkillId);
    }
  }

  private getElementColorHex(element: string): number {
    switch (element) {
      case 'fire': return 0xff4444;
      case 'ice': return 0x38bdf8;
      case 'shadow': return 0xa855f7;
      case 'crystal': return 0x67e8f9;
      case 'earth': return 0xf59e0b;
      case 'wind': return 0xa7f3d0;
      default: return 0xffffff;
    }
  }
}

export const skillCastingEngine = SkillCastingEngine.getInstance();
