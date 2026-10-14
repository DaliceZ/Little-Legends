import Phaser from 'phaser';
import { PixelTextureGenerator } from '../rendering/PixelTextureGenerator';
import { KaelSpriteLoader } from '../rendering/KaelSpriteLoader';
import { VFXManager } from '../rendering/VFXManager';
import { useGameStore } from '../../app/store/useGameStore';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  async create() {
    // 1. Generate procedural pixel-art tiles and enemies
    PixelTextureGenerator.generateAll(this);

    // 2. Generate VFX Asset Pack textures (Fire, Ice, Shadow, Crystal, Earth, Wind)
    VFXManager.generateVFXTextures(this);

    // 3. Load user-provided authentic Kael pixel art sprite sheet and portrait
    await KaelSpriteLoader.loadKaelSheet(this);
    const portraitUrl = KaelSpriteLoader.getPortraitDataUrl();
    if (portraitUrl) {
      useGameStore.getState().setKaelPortrait(portraitUrl);
    }

    // 4. Create fallback/registered animations for Kael
    const directions = ['down', 'up', 'left', 'right'];

    directions.forEach((dir) => {
      // Walk animation
      if (!this.anims.exists(`kael_walk_${dir}`)) {
        this.anims.create({
          key: `kael_walk_${dir}`,
          frames: [
            { key: `kael_walk_${dir}_0` },
            { key: `kael_walk_${dir}_1` },
            { key: `kael_walk_${dir}_2` },
            { key: `kael_walk_${dir}_3` },
          ].filter((f) => this.textures.exists(f.key)),
          frameRate: 8,
          repeat: -1,
        });
      }

      // Attack animation
      if (!this.anims.exists(`kael_attack_${dir}`)) {
        this.anims.create({
          key: `kael_attack_${dir}`,
          frames: [
            { key: `kael_attack_${dir}_0` },
            { key: `kael_attack_${dir}_1` },
            { key: `kael_attack_${dir}_2` },
          ].filter((f) => this.textures.exists(f.key)),
          frameRate: 12,
          repeat: 0,
        });
      }

      // Dodge animation
      if (!this.anims.exists(`kael_dodge_${dir}`)) {
        this.anims.create({
          key: `kael_dodge_${dir}`,
          frames: [
            { key: `kael_dodge_${dir}_0` },
            { key: `kael_dodge_${dir}_1` },
          ].filter((f) => this.textures.exists(f.key)),
          frameRate: 10,
          repeat: 0,
        });
      }
    });

    // Proceed to Everlight Village WorldScene
    this.scene.start('WorldScene');
  }
}

