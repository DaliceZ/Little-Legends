import Phaser from 'phaser';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export class LightingManager {
  private ambientOverlay: Phaser.GameObjects.Rectangle | null = null;
  private timeOfDay: TimeOfDay = 'day';
  private cycleTimer: number = 0;
  private isDungeon: boolean = false;

  private pointLights: Phaser.GameObjects.Image[] = [];
  private playerLight: Phaser.GameObjects.Image | null = null;
  private trackedPlayer: Phaser.GameObjects.Sprite | null = null;

  constructor(private scene: Phaser.Scene, isDungeon: boolean = false) {
    this.isDungeon = isDungeon;
    this.initLighting();
  }

  private initLighting() {
    const width = this.scene.physics.world.bounds.width || 1800;
    const height = this.scene.physics.world.bounds.height || 1800;

    // Create ambient color overlay spanning entire map
    this.ambientOverlay = this.scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setDepth(270)
      .setScrollFactor(1);

    if (this.isDungeon) {
      // Dungeons have deep mysterious obsidian blue ambient
      this.ambientOverlay.setFillStyle(0x060913, 0.62);
    }
  }

  /**
   * Adds an illuminated radial point light (e.g. wall torches, braziers, altars)
   */
  addPointLight(
    x: number,
    y: number,
    radius: number = 70,
    tint: number = 0xf97316,
    baseAlpha: number = 0.45,
    flicker: boolean = true
  ): Phaser.GameObjects.Image | null {
    if (!this.scene.textures.exists('vfx_light_disc')) return null;

    const scale = radius / 64;
    const light = this.scene.add
      .image(x, y, 'vfx_light_disc')
      .setOrigin(0.5, 0.5)
      .setScale(scale)
      .setTint(tint)
      .setAlpha(baseAlpha)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(275);

    if (flicker) {
      this.scene.tweens.add({
        targets: light,
        alpha: { from: baseAlpha * 0.85, to: baseAlpha * 1.15 },
        scaleX: { from: scale * 0.94, to: scale * 1.06 },
        scaleY: { from: scale * 0.94, to: scale * 1.06 },
        duration: 160 + Math.random() * 80,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    this.pointLights.push(light);
    return light;
  }

  /**
   * Attaches an Echo Crystal light aura following the player character
   */
  attachPlayerLight(
    player: Phaser.GameObjects.Sprite,
    tint: number = 0x38bdf8,
    radius: number = 100
  ) {
    if (!this.scene.textures.exists('vfx_light_disc')) return;

    this.trackedPlayer = player;
    const scale = radius / 64;

    this.playerLight = this.scene.add
      .image(player.x, player.y, 'vfx_light_disc')
      .setOrigin(0.5, 0.5)
      .setScale(scale)
      .setTint(tint)
      .setAlpha(0.38)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(276);

    // Subtle breathing pulse
    this.scene.tweens.add({
      targets: this.playerLight,
      alpha: { from: 0.32, to: 0.44 },
      scale: { from: scale * 0.95, to: scale * 1.05 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  update(_time: number, delta: number) {
    // Sync player light position
    if (this.playerLight && this.trackedPlayer && this.trackedPlayer.active) {
      this.playerLight.setPosition(this.trackedPlayer.x, this.trackedPlayer.y);
    }

    if (this.isDungeon || !this.ambientOverlay) return;

    // Day/Night cycle: updates every 60 seconds of gameplay
    this.cycleTimer += delta;
    if (this.cycleTimer >= 60000) {
      this.cycleTimer = 0;
      this.advanceTimeOfDay();
    }
  }

  private advanceTimeOfDay() {
    const cycles: TimeOfDay[] = ['dawn', 'day', 'dusk', 'night'];
    const nextIdx = (cycles.indexOf(this.timeOfDay) + 1) % cycles.length;
    this.setTimeOfDay(cycles[nextIdx]);
  }

  setTimeOfDay(tod: TimeOfDay) {
    this.timeOfDay = tod;
    if (!this.ambientOverlay) return;

    let targetColor = 0x000000;
    let targetAlpha = 0;

    switch (tod) {
      case 'dawn':
        targetColor = 0xffedd5; // Soft warm peach
        targetAlpha = 0.15;
        break;
      case 'day':
        targetColor = 0xffffff;
        targetAlpha = 0;
        break;
      case 'dusk':
        targetColor = 0x7c2d12; // Amber/Rust sunset
        targetAlpha = 0.28;
        break;
      case 'night':
        targetColor = 0x0f172a; // Deep midnight slate
        targetAlpha = 0.55;
        break;
    }

    this.scene.tweens.add({
      targets: this.ambientOverlay,
      alpha: targetAlpha,
      duration: 2000,
      onStart: () => {
        this.ambientOverlay?.setFillStyle(targetColor, this.ambientOverlay.alpha);
      },
    });
  }

  getTimeOfDay(): TimeOfDay {
    return this.timeOfDay;
  }

  destroy() {
    this.pointLights.forEach((l) => l.destroy());
    this.pointLights = [];
    if (this.playerLight) {
      this.playerLight.destroy();
      this.playerLight = null;
    }
    if (this.ambientOverlay) {
      this.ambientOverlay.destroy();
      this.ambientOverlay = null;
    }
  }
}
