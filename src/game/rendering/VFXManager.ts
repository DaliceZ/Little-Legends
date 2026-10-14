import Phaser from 'phaser';

export class VFXManager {
  private static texturesGenerated = false;

  /**
   * Generates custom pixel-art sprite animation sheets and particles for all 6 elements.
   */
  static generateVFXTextures(scene: Phaser.Scene) {
    if (this.texturesGenerated) return;
    this.texturesGenerated = true;

    // 1. FIREBALL (32x32)
    {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(16, 16, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(16, 16, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(16, 16, 4, 0, Math.PI * 2);
      ctx.fill();
      scene.textures.addCanvas('vfx_fireball', canvas);
    }

    // 2. METEOR (48x48)
    {
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = '#78350f';
      ctx.fillRect(14, 14, 20, 20);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(10, 10, 28, 28);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(16, 16, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 20, 8, 8);
      scene.textures.addCanvas('vfx_meteor', canvas);
    }

    // 3. ICE SPEAR (48x16)
    {
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 16;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = '#0284c7';
      ctx.fillRect(4, 5, 36, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(8, 6, 32, 4);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(48, 8);
      ctx.lineTo(38, 2);
      ctx.lineTo(38, 14);
      ctx.closePath();
      ctx.fill();
      scene.textures.addCanvas('vfx_ice_spear', canvas);
    }

    // 4. FROST NOVA RING (64x64)
    {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.stroke();

      // Sharp icicle spokes
      ctx.fillStyle = '#e0f2fe';
      for (let i = 0; i < 8; i++) {
        const rad = (i * Math.PI) / 4;
        const x = 32 + Math.cos(rad) * 26;
        const y = 32 + Math.sin(rad) * 26;
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }
      scene.textures.addCanvas('vfx_frost_nova', canvas);
    }

    // 5. SHADOW BURST & SLASH (48x48)
    {
      const canvas = document.createElement('canvas');
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.arc(24, 24, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(24, 24, 16, -Math.PI * 0.3, Math.PI * 0.7);
      ctx.stroke();
      scene.textures.addCanvas('vfx_shadow_burst', canvas);
    }

    // 6. ECHO CRYSTAL NOVA (64x64)
    {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(32, 32, 26, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(32, 32, 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(30, 6, 4, 8);
      ctx.fillRect(30, 50, 4, 8);
      ctx.fillRect(6, 30, 8, 4);
      ctx.fillRect(50, 30, 8, 4);
      scene.textures.addCanvas('vfx_crystal_nova', canvas);
    }

    // 7. GROUND CRACK FISSURE (56x56)
    {
      const canvas = document.createElement('canvas');
      canvas.width = 56;
      canvas.height = 56;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(28, 28);
      ctx.lineTo(8, 12);
      ctx.moveTo(28, 28);
      ctx.lineTo(48, 16);
      ctx.moveTo(28, 28);
      ctx.lineTo(38, 48);
      ctx.moveTo(28, 28);
      ctx.lineTo(14, 44);
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(26, 26, 4, 4);
      scene.textures.addCanvas('vfx_ground_crack', canvas);
    }

    // 8. TITAN'S HAMMER (64x64)
    {
      const canvas = document.createElement('canvas');
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext('2d')!;
      ctx.imageSmoothingEnabled = false;

      ctx.fillStyle = '#b45309';
      ctx.fillRect(20, 10, 24, 20); // Head
      ctx.fillStyle = '#fbbf24'; // Gold trims
      ctx.fillRect(16, 12, 4, 16);
      ctx.fillRect(44, 12, 4, 16);
      ctx.fillStyle = '#64748b'; // Handle
      ctx.fillRect(30, 30, 4, 28);
      scene.textures.addCanvas('vfx_titan_hammer', canvas);
    }
  }

  /**
   * Spawns an impact VFX with animation and camera feedback.
   */
  static playEffect(
    scene: Phaser.Scene,
    type: 'fire' | 'ice' | 'shadow' | 'crystal' | 'earth' | 'wind',
    x: number,
    y: number,
    angle: number = 0
  ) {
    this.generateVFXTextures(scene);

    switch (type) {
      case 'fire': {
        const fireball = scene.add.sprite(x, y, 'vfx_fireball').setDepth(400);
        scene.tweens.add({
          targets: fireball,
          scale: 1.8,
          alpha: 0,
          duration: 350,
          onComplete: () => fireball.destroy(),
        });
        scene.cameras.main.shake(120, 0.008);
        break;
      }
      case 'ice': {
        const nova = scene.add.sprite(x, y, 'vfx_frost_nova').setDepth(400);
        scene.tweens.add({
          targets: nova,
          scale: 2.0,
          alpha: 0,
          duration: 400,
          onComplete: () => nova.destroy(),
        });
        break;
      }
      case 'shadow': {
        const burst = scene.add.sprite(x, y, 'vfx_shadow_burst').setDepth(400);
        scene.tweens.add({
          targets: burst,
          scale: 2.2,
          alpha: 0,
          duration: 380,
          onComplete: () => burst.destroy(),
        });
        break;
      }
      case 'crystal': {
        const cNova = scene.add.sprite(x, y, 'vfx_crystal_nova').setDepth(400);
        scene.tweens.add({
          targets: cNova,
          scale: 2.5,
          alpha: 0,
          duration: 500,
          onComplete: () => cNova.destroy(),
        });
        scene.cameras.main.shake(150, 0.012);
        break;
      }
      case 'earth': {
        const crack = scene.add.sprite(x, y, 'vfx_ground_crack').setDepth(350);
        scene.tweens.add({
          targets: crack,
          scale: 1.6,
          alpha: 0,
          duration: 600,
          onComplete: () => crack.destroy(),
        });
        scene.cameras.main.shake(180, 0.015);
        break;
      }
      case 'wind': {
        const ring = scene.add.sprite(x, y, 'fx_whirlwind').setAngle(angle).setDepth(400);
        scene.tweens.add({
          targets: ring,
          scale: 1.9,
          alpha: 0,
          duration: 250,
          onComplete: () => ring.destroy(),
        });
        break;
      }
    }
  }
}
