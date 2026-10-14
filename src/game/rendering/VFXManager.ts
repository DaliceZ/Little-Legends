import Phaser from 'phaser';
import { useGameStore } from '../../app/store/useGameStore';

export class VFXManager {
  private static addTextureIfMissing(
    scene: Phaser.Scene,
    key: string,
    width: number,
    height: number,
    drawFn: (ctx: CanvasRenderingContext2D) => void
  ) {
    if (!scene || !scene.textures) return;
    if (scene.textures.exists(key)) return;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    drawFn(ctx);

    try {
      scene.textures.addCanvas(key, canvas);
    } catch {
      // Texture might already exist in global manager
    }
  }

  /**
   * Generates custom pixel-art sprite animation sheets and particles for all elements.
   * Checks per-game-instance texture manager to survive scene changes and React StrictMode remounts.
   */
  static generateVFXTextures(scene: Phaser.Scene) {
    if (!scene || !scene.textures) return;

    // Quick exit if main VFX textures are already present in this game instance
    if (scene.textures.exists('vfx_wind') && scene.textures.exists('vfx_slash') && scene.textures.exists('vfx_fireball')) {
      return;
    }

    // 1. WIND / WHIRLWIND (48x48) - Emerald & Sky Blue Spiraling Cyclone
    this.addTextureIfMissing(scene, 'vfx_wind', 48, 48, (ctx) => {
      // Outer emerald spiral arc
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(24, 24, 20, 0, Math.PI * 1.6);
      ctx.stroke();

      // Inner cyan wind blade
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(24, 24, 15, Math.PI * 0.5, Math.PI * 2.1);
      ctx.stroke();

      // Sharp white wind crescents
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(24, 24, 10, -Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();

      // Wind dust motes
      ctx.fillStyle = '#a7f3d0';
      ctx.fillRect(8, 12, 3, 3);
      ctx.fillRect(36, 16, 3, 3);
      ctx.fillRect(16, 36, 3, 3);
      ctx.fillRect(34, 32, 2, 2);
    });

    // Ensure legacy 'fx_whirlwind' points to valid canvas if requested
    this.addTextureIfMissing(scene, 'fx_whirlwind', 48, 48, (ctx) => {
      ctx.strokeStyle = '#34d399';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(24, 24, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = '#a7f3d0';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(24, 24, 14, 0, Math.PI * 1.5);
      ctx.stroke();
    });

    // 2. PHYSICAL / SLASH (48x48) - Gleaming Silver & Azure Crescent Slash
    this.addTextureIfMissing(scene, 'vfx_slash', 48, 48, (ctx) => {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(24, 24, 18, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(24, 24, 19, -Math.PI * 0.38, Math.PI * 0.38);
      ctx.stroke();

      // Slash sparks
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(38, 20, 4, 3);
      ctx.fillRect(34, 12, 3, 3);
      ctx.fillRect(34, 28, 3, 3);
    });

    // Ensure legacy 'fx_slash' exists
    this.addTextureIfMissing(scene, 'fx_slash', 48, 48, (ctx) => {
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(24, 24, 18, -Math.PI * 0.4, Math.PI * 0.4);
      ctx.stroke();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(24, 24, 19, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
    });

    // 3. FIREBALL (32x32) - Radiant Fiery Orb with Yellow Core
    this.addTextureIfMissing(scene, 'vfx_fireball', 32, 32, (ctx) => {
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(16, 16, 13, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(16, 16, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(16, 16, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(14, 14, 4, 4);
    });

    // 4. METEOR (48x48) - Molten Core with Fiery Ember Trails
    this.addTextureIfMissing(scene, 'vfx_meteor', 48, 48, (ctx) => {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(14, 14, 20, 20);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(10, 10, 28, 28);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(16, 16, 16, 16);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(20, 20, 8, 8);
    });

    // 5. ICE SPEAR (48x16) - Crystalline Piercing Lance
    this.addTextureIfMissing(scene, 'vfx_ice_spear', 48, 16, (ctx) => {
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
    });

    // 6. FROST NOVA RING (64x64) - Expanding Glacial Frost Ring
    this.addTextureIfMissing(scene, 'vfx_frost_nova', 64, 64, (ctx) => {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(32, 32, 28, 0, Math.PI * 2);
      ctx.stroke();

      // Sharp icicle spokes
      ctx.fillStyle = '#e0f2fe';
      for (let i = 0; i < 8; i++) {
        const rad = (i * Math.PI) / 4;
        const x = 32 + Math.cos(rad) * 26;
        const y = 32 + Math.sin(rad) * 26;
        ctx.fillRect(x - 2, y - 2, 5, 5);
      }
    });

    // 7. SHADOW BURST (48x48) - Dark Violet Void Claws
    this.addTextureIfMissing(scene, 'vfx_shadow_burst', 48, 48, (ctx) => {
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.arc(24, 24, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(24, 24, 16, -Math.PI * 0.3, Math.PI * 0.7);
      ctx.stroke();

      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(24, 24, 12, Math.PI * 0.4, Math.PI * 1.3);
      ctx.stroke();
    });

    // 8. ECHO CRYSTAL NOVA (64x64) - Prismatic Resonance Ring with Star Glyphs
    this.addTextureIfMissing(scene, 'vfx_crystal_nova', 64, 64, (ctx) => {
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(32, 32, 26, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = '#7dd3fc';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(32, 32, 22, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(30, 4, 4, 10);
      ctx.fillRect(30, 50, 4, 10);
      ctx.fillRect(4, 30, 10, 4);
      ctx.fillRect(50, 30, 10, 4);
    });

    // 9. GROUND CRACK FISSURE (56x56) - Jagged Earth Shatter
    this.addTextureIfMissing(scene, 'vfx_ground_crack', 56, 56, (ctx) => {
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3.5;
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
      ctx.fillRect(25, 25, 6, 6);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(26, 26, 4, 4);
    });

    // 10. LIGHTNING BURST (40x40) - Crackling Electric Arc
    this.addTextureIfMissing(scene, 'vfx_lightning', 40, 40, (ctx) => {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(20, 2);
      ctx.lineTo(14, 18);
      ctx.lineTo(24, 18);
      ctx.lineTo(16, 38);
      ctx.stroke();

      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, 4);
      ctx.lineTo(15, 17);
      ctx.lineTo(23, 17);
      ctx.lineTo(17, 36);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(19, 16, 3, 3);
    });
  }

  /**
   * Spawns an impact VFX with animation and camera feedback.
   * Completely safe against missing texture errors.
   */
  static playEffect(
    scene: Phaser.Scene,
    type: string = 'physical',
    x: number,
    y: number,
    angle: number = 0
  ) {
    if (!scene || !scene.add) return;

    // Ensure textures are generated in the current scene's game context
    this.generateVFXTextures(scene);

    const normType = (type || 'physical').toLowerCase();
    let textureKey = 'vfx_slash';
    let scaleFrom = 0.8;
    let scaleTo = 1.8;
    let duration = 260;
    let shakeIntensity = 0;
    let shakeDuration = 0;

    switch (normType) {
      case 'wind':
        textureKey = scene.textures.exists('vfx_wind') ? 'vfx_wind' : (scene.textures.exists('fx_whirlwind') ? 'fx_whirlwind' : 'vfx_slash');
        scaleTo = 2.0;
        duration = 260;
        break;

      case 'fire':
        textureKey = 'vfx_fireball';
        scaleTo = 2.1;
        duration = 320;
        shakeIntensity = 0.008;
        shakeDuration = 120;
        break;

      case 'ice':
        textureKey = 'vfx_frost_nova';
        scaleTo = 2.2;
        duration = 360;
        break;

      case 'shadow':
        textureKey = 'vfx_shadow_burst';
        scaleTo = 2.2;
        duration = 340;
        break;

      case 'crystal':
        textureKey = 'vfx_crystal_nova';
        scaleTo = 2.4;
        duration = 450;
        shakeIntensity = 0.012;
        shakeDuration = 150;
        break;

      case 'earth':
        textureKey = 'vfx_ground_crack';
        scaleTo = 1.7;
        duration = 550;
        shakeIntensity = 0.015;
        shakeDuration = 180;
        break;

      case 'lightning':
        textureKey = 'vfx_lightning';
        scaleTo = 2.0;
        duration = 240;
        shakeIntensity = 0.009;
        shakeDuration = 100;
        break;

      case 'physical':
      default:
        textureKey = scene.textures.exists('vfx_slash') ? 'vfx_slash' : (scene.textures.exists('fx_slash') ? 'fx_slash' : 'vfx_wind');
        scaleTo = 1.6;
        duration = 200;
        break;
    }

    // Safety fallback: if texture somehow doesn't exist, generate and re-check
    if (!scene.textures.exists(textureKey)) {
      this.generateVFXTextures(scene);
    }

    if (!scene.textures.exists(textureKey)) {
      console.warn(`[VFXManager] Texture '${textureKey}' could not be resolved. Skipping effect.`);
      return;
    }

    const fxSprite = scene.add.sprite(x, y, textureKey)
      .setAngle(angle)
      .setDepth(450)
      .setScale(scaleFrom);

    scene.tweens.add({
      targets: fxSprite,
      scale: scaleTo,
      alpha: 0,
      duration,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        if (fxSprite.active) {
          fxSprite.destroy();
        }
      },
    });

    const screenShake = useGameStore.getState().settings?.screenShake ?? true;
    if (shakeIntensity > 0 && scene.cameras?.main && screenShake) {
      scene.cameras.main.shake(shakeDuration, shakeIntensity);
    }
  }
}
