import Phaser from 'phaser';
import { PixelTextureGenerator } from '../rendering/PixelTextureGenerator';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // Generate all procedural pixel-art textures
    PixelTextureGenerator.generateAll(this);

    // Create global animations for player Kael
    const directions = ['down', 'up', 'left', 'right'];

    directions.forEach((dir) => {
      // Walk animation
      this.anims.create({
        key: `kael_walk_${dir}`,
        frames: [
          { key: `kael_walk_${dir}_0` },
          { key: `kael_walk_${dir}_1` },
          { key: `kael_walk_${dir}_2` },
          { key: `kael_walk_${dir}_3` },
        ],
        frameRate: 8,
        repeat: -1,
      });

      // Attack animation
      this.anims.create({
        key: `kael_attack_${dir}`,
        frames: [
          { key: `kael_attack_${dir}_0` },
          { key: `kael_attack_${dir}_1` },
          { key: `kael_attack_${dir}_2` },
        ],
        frameRate: 12,
        repeat: 0,
      });

      // Dodge animation
      this.anims.create({
        key: `kael_dodge_${dir}`,
        frames: [
          { key: `kael_dodge_${dir}_0` },
          { key: `kael_dodge_${dir}_1` },
        ],
        frameRate: 10,
        repeat: 0,
      });
    });

    // Proceed to Everlight Village WorldScene
    this.scene.start('WorldScene');
  }
}
