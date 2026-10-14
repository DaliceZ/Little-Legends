import Phaser from 'phaser';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

export class LightingManager {
  private ambientOverlay: Phaser.GameObjects.Rectangle | null = null;
  private timeOfDay: TimeOfDay = 'day';
  private cycleTimer: number = 0;
  private isDungeon: boolean = false;

  constructor(private scene: Phaser.Scene, isDungeon: boolean = false) {
    this.isDungeon = isDungeon;
    this.initLighting();
  }

  private initLighting() {
    const width = this.scene.physics.world.bounds.width || 1600;
    const height = this.scene.physics.world.bounds.height || 1200;

    // Create ambient color overlay spanning entire map
    this.ambientOverlay = this.scene.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setDepth(290)
      .setScrollFactor(1);

    if (this.isDungeon) {
      // Dungeons have deep mysterious blue-dark ambient
      this.ambientOverlay.setFillStyle(0x0c1022, 0.45);
    }
  }

  update(_time: number, delta: number) {
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
}
