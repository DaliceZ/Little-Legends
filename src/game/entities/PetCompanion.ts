import Phaser from 'phaser';
import { PetInstance, PetSpeciesDefinition } from '../../shared/types';
import { getPetSpecies, calculatePetStats, calculateRequiredPetExp } from '../../features/pets/petRegistry';
import { useGameStore } from '../../app/store/useGameStore';
import { VFXManager } from '../rendering/VFXManager';
import { soundManager } from '../../shared/utils/soundSynthesizer';

export class PetCompanion extends Phaser.GameObjects.Container {
  private petData: PetInstance;
  private species: PetSpeciesDefinition;
  private petSprite: Phaser.GameObjects.Sprite;
  private shadow: Phaser.GameObjects.Ellipse;
  private nameText: Phaser.GameObjects.Text;
  private targetPlayer: Phaser.Physics.Arcade.Sprite;
  private lastAbilityTime: number = 0;
  private bobTimer: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    petData: PetInstance,
    targetPlayer: Phaser.Physics.Arcade.Sprite
  ) {
    super(scene, x, y);
    this.petData = petData;
    this.species = getPetSpecies(petData.speciesId);
    this.targetPlayer = targetPlayer;

    this.ensurePetTexture(scene, this.species.id);

    // 1. Soft Shadow
    this.shadow = scene.add.ellipse(0, 14, 18, 8, 0x000000, 0.35);
    this.add(this.shadow);

    // 2. Pet Sprite
    this.petSprite = scene.add.sprite(0, 0, `pet_${this.species.id}`);
    this.add(this.petSprite);

    // 3. Mini Pet Tag (Nickname + Lv)
    this.nameText = scene.add.text(0, -18, `Lv.${petData.level} ${petData.nickname}`, {
      fontSize: '9px',
      color: this.species.accentColor,
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);
    this.add(this.nameText);

    this.setDepth(200);
    scene.add.existing(this);
  }

  private ensurePetTexture(scene: Phaser.Scene, speciesId: string) {
    const key = `pet_${speciesId}`;
    if (scene.textures.exists(key)) return;

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    // Draw customized cute pixel art for each pet species
    switch (speciesId) {
      case 'forest_slime': {
        // Cute green bouncy slime
        ctx.fillStyle = '#4ade80';
        ctx.beginPath();
        ctx.ellipse(16, 18, 11, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(16, 21, 10, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(12, 16, 2, 3);
        ctx.fillRect(18, 16, 2, 3);
        // Blushes
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(10, 19, 2, 1);
        ctx.fillRect(20, 19, 2, 1);
        // Leaf on head
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.ellipse(16, 9, 3, 4, 0.4, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'ember_fox': {
        // Cute orange kitsune fox with ears and flame tail
        ctx.fillStyle = '#f97316';
        // Body
        ctx.beginPath();
        ctx.ellipse(16, 19, 9, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Head
        ctx.beginPath();
        ctx.ellipse(16, 13, 7, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.beginPath();
        ctx.moveTo(10, 11); ctx.lineTo(12, 5); ctx.lineTo(14, 11);
        ctx.moveTo(18, 11); ctx.lineTo(20, 5); ctx.lineTo(22, 11);
        ctx.fill();
        // White muzzle & chest
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.ellipse(16, 15, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
        // Big amber eyes
        ctx.fillStyle = '#78350f';
        ctx.fillRect(13, 11, 2, 2);
        ctx.fillRect(17, 11, 2, 2);
        // Flame tail
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.ellipse(24, 17, 5, 7, 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(26, 15, 3, 4, 0.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }
      case 'frost_bunny': {
        // Fluffy arctic hare with long frosty ears
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.ellipse(16, 19, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(12, 3, 3, 10);
        ctx.fillRect(17, 3, 3, 10);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect(13, 5, 1, 7);
        ctx.fillRect(18, 5, 1, 7);
        // Blue eyes
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(13, 16, 2, 2);
        ctx.fillRect(17, 16, 2, 2);
        break;
      }
      case 'thunder_cub': {
        // Electric yellow tiger cub
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.ellipse(16, 18, 9, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(16, 12, 7, 6, 0, 0, Math.PI * 2);
        ctx.fill();
        // Ears
        ctx.fillStyle = '#ca8a04';
        ctx.fillRect(11, 6, 3, 3);
        ctx.fillRect(18, 6, 3, 3);
        // Dark stripes
        ctx.fillStyle = '#854d0e';
        ctx.fillRect(15, 8, 2, 2);
        ctx.fillRect(11, 18, 2, 3);
        ctx.fillRect(19, 18, 2, 3);
        // Eyes
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(13, 12, 2, 2);
        ctx.fillRect(17, 12, 2, 2);
        break;
      }
      case 'shadow_cat': {
        // Void panther with glowing purple eyes
        ctx.fillStyle = '#3b0764';
        ctx.beginPath();
        ctx.ellipse(16, 18, 8, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(16, 12, 6, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Pointy ears
        ctx.fillStyle = '#581c87';
        ctx.beginPath();
        ctx.moveTo(11, 10); ctx.lineTo(12, 4); ctx.lineTo(14, 10);
        ctx.moveTo(18, 10); ctx.lineTo(20, 4); ctx.lineTo(21, 10);
        ctx.fill();
        // Glowing purple eyes
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(13, 11, 2, 2);
        ctx.fillRect(17, 11, 2, 2);
        // Crescent moon on forehead
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(15, 8, 2, 1);
        break;
      }
      case 'crystal_sprite': {
        // Winged crystal fairy
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.ellipse(16, 16, 6, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        // Fluttering fairy wings
        ctx.fillStyle = 'rgba(207, 250, 254, 0.8)';
        ctx.beginPath();
        ctx.ellipse(9, 14, 5, 3, -0.4, 0, Math.PI * 2);
        ctx.ellipse(23, 14, 5, 3, 0.4, 0, Math.PI * 2);
        ctx.fill();
        // Eyes
        ctx.fillStyle = '#0891b2';
        ctx.fillRect(14, 15, 1, 2);
        ctx.fillRect(17, 15, 1, 2);
        // Floating crystal tiara
        ctx.fillStyle = '#a5f3fc';
        ctx.fillRect(15, 7, 2, 3);
        break;
      }
      case 'moss_turtle': {
        // Mossy stone tortoise
        ctx.fillStyle = '#4d7c0f';
        ctx.beginPath();
        ctx.ellipse(16, 18, 10, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#65a30d';
        ctx.fillRect(14, 15, 4, 4);
        // Head
        ctx.fillStyle = '#84cc16';
        ctx.beginPath();
        ctx.arc(8, 18, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(7, 17, 1, 1);
        break;
      }
      case 'baby_dragon': {
        // Adorable half-dragon hatchling with horns & tiny wings
        ctx.fillStyle = '#db2777';
        // Body
        ctx.beginPath();
        ctx.ellipse(16, 18, 9, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        // Curved horns
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(11, 4, 2, 4);
        ctx.fillRect(19, 4, 2, 4);
        // Tiny wings
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.ellipse(9, 16, 4, 6, -0.5, 0, Math.PI * 2);
        ctx.ellipse(23, 16, 4, 6, 0.5, 0, Math.PI * 2);
        ctx.fill();
        // Eyes with draconic amber slit
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(13, 14, 2, 3);
        ctx.fillRect(17, 14, 2, 3);
        ctx.fillStyle = '#831843';
        ctx.fillRect(14, 15, 1, 2);
        ctx.fillRect(18, 15, 1, 2);
        break;
      }
      default: {
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(16, 16, 8, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    scene.textures.addCanvas(key, canvas);
  }

  public update(time: number, delta: number, enemies: Array<{ x: number; y: number; hp: number; isDead?: boolean; takeDamage: (dmg: number, isCrit: boolean, elem: string) => void }>) {
    if (!this.targetPlayer || !this.targetPlayer.active) return;

    // 1. Follow Player Smoothly (Lerp behind player)
    const targetOffset = 32;
    const targetX = this.targetPlayer.x - (this.petSprite.flipX ? -targetOffset : targetOffset);
    const targetY = this.targetPlayer.y - 10;

    // Smooth lerp
    this.x = Phaser.Math.Linear(this.x, targetX, 0.08);
    this.y = Phaser.Math.Linear(this.y, targetY, 0.08);

    // Face player motion direction
    if (this.targetPlayer.body) {
      const vx = this.targetPlayer.body.velocity.x;
      if (vx > 10) this.petSprite.setFlipX(false);
      else if (vx < -10) this.petSprite.setFlipX(true);
    }

    // 2. Cute Bobbing Motion
    this.bobTimer += delta * 0.005;
    this.petSprite.y = Math.sin(this.bobTimer) * 3;

    // 3. Automated Combat & Support Actions
    if (time - this.lastAbilityTime >= this.species.abilityCooldownMs) {
      this.executeCompanionAbility(time, enemies);
    }
  }

  private executeCompanionAbility(
    time: number,
    enemies: Array<{ x: number; y: number; hp: number; isDead?: boolean; takeDamage: (dmg: number, isCrit: boolean, elem: string) => void }>
  ) {
    this.lastAbilityTime = time;
    const stats = calculatePetStats(this.petData);
    const gameStore = useGameStore.getState();

    // Little jump/squash anim
    this.scene.tweens.add({
      targets: this.petSprite,
      scaleY: 1.3,
      scaleX: 0.8,
      duration: 120,
      yoyo: true,
    });

    // Check if support ability (target player) or attack ability (target enemy)
    if (this.species.role === 'healer') {
      // Heal player
      const healAmt = stats.supportPower;
      const newHp = Math.min(gameStore.stats.maxHp, gameStore.stats.hp + healAmt);
      gameStore.setPlayerStats({
        ...gameStore.stats,
        hp: newHp,
      });
      soundManager.playSfx('pickup');
      VFXManager.playEffect(this.scene, 'wind', this.targetPlayer.x, this.targetPlayer.y);
      this.showFloatingText(`+${healAmt} HP`, '#4ade80');
      return;
    }

    if (this.species.role === 'mana_battery') {
      // Restore player MP
      const mpAmt = stats.supportPower;
      const newMp = Math.min(gameStore.stats.maxMp, gameStore.stats.mp + mpAmt);
      gameStore.setPlayerStats({
        ...gameStore.stats,
        mp: newMp,
      });
      soundManager.playSfx('pickup');
      VFXManager.playEffect(this.scene, 'crystal', this.targetPlayer.x, this.targetPlayer.y);
      this.showFloatingText(`+${mpAmt} MP`, '#67e8f9');
      return;
    }

    if (this.species.role === 'shock_buffer') {
      // Speed surge
      this.showFloatingText('SPEED UP!', '#facc15');
      VFXManager.playEffect(this.scene, 'wind', this.x, this.y);
      return;
    }

    // Offensive Abilities: Find nearest enemy within 140px
    let nearest: any = null;
    let minDist = 140;

    for (const e of enemies) {
      if (!e.isDead && e.hp > 0) {
        const d = Phaser.Math.Distance.Between(this.x, this.y, e.x, e.y);
        if (d < minDist) {
          minDist = d;
          nearest = e;
        }
      }
    }

    if (nearest) {
      const dmg = Math.round(stats.atk * (this.species.role === 'legendary_breaker' ? 2.6 : 1.8));
      nearest.takeDamage(dmg, false, this.species.element);
      VFXManager.playEffect(this.scene, (this.species.element as any) || 'crystal', nearest.x, nearest.y);
      soundManager.playSfx('hit');
    }
  }

  public gainExp(amount: number) {
    this.petData.exp += amount;
    if (this.petData.exp >= this.petData.maxExp) {
      this.petData.exp -= this.petData.maxExp;
      this.petData.level += 1;
      this.petData.maxExp = calculateRequiredPetExp(this.petData.level);

      // Level Up celebratory effect
      this.nameText.setText(`Lv.${this.petData.level} ${this.petData.nickname}`);
      this.showFloatingText('LEVEL UP!', '#fbbf24');
      soundManager.playSfx('victory');

      // Update in game store
      const gameStore = useGameStore.getState();
      gameStore.showNotification(
        'PET LEVEL UP!',
        `${this.petData.nickname} reached Level ${this.petData.level}!`,
        'success'
      );
    }
  }

  private showFloatingText(msg: string, color: string) {
    const txt = this.scene.add.text(this.x, this.y - 20, msg, {
      fontSize: '11px',
      color,
      stroke: '#000000',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.scene.tweens.add({
      targets: txt,
      y: txt.y - 24,
      alpha: 0,
      duration: 800,
      onComplete: () => txt.destroy(),
    });
  }

  public getPetData(): PetInstance {
    return this.petData;
  }
}
