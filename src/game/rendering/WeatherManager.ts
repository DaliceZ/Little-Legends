import Phaser from 'phaser';

export type WeatherType = 'clear' | 'fireflies' | 'leaves' | 'rain' | 'mist' | 'embers';

export class WeatherManager {
  private particles: Phaser.GameObjects.Arc[] = [];
  private currentWeather: WeatherType = 'leaves';
  private spawnTimer: number = 0;
  private quality: 'low' | 'medium' | 'high' | 'ultra' = 'high';

  constructor(private scene: Phaser.Scene, private isDungeon: boolean = false) {
    if (this.isDungeon) {
      this.currentWeather = 'mist';
    }
  }

  setQuality(q: 'low' | 'medium' | 'high' | 'ultra') {
    this.quality = q;
  }

  setWeather(type: WeatherType) {
    this.currentWeather = type;
    this.clearAll();
  }

  update(_time: number, delta: number) {
    if (this.quality === 'low') return;

    this.spawnTimer += delta;
    const interval = this.quality === 'ultra' ? 80 : this.quality === 'high' ? 140 : 250;

    if (this.spawnTimer >= interval) {
      this.spawnTimer = 0;
      this.spawnParticle();
    }

    // Update and prune particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      if (!p.active) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnParticle() {
    const cam = this.scene.cameras.main;
    const startX = cam.scrollX + Math.random() * cam.width;
    const startY = cam.scrollY + (this.currentWeather === 'rain' ? -20 : Math.random() * cam.height);

    if (this.currentWeather === 'leaves') {
      // Golden/Amber falling autumn leaf
      const leaf = this.scene.add.circle(startX, startY, 2, 0xf59e0b, 0.7).setDepth(280);
      this.particles.push(leaf);

      this.scene.tweens.add({
        targets: leaf,
        x: startX + (Math.random() * 60 - 30),
        y: startY + 120,
        alpha: 0,
        duration: 2500,
        ease: 'Sine.easeInOut',
        onComplete: () => leaf.destroy(),
      });
    } else if (this.currentWeather === 'fireflies') {
      // Glowing green/cyan firefly
      const color = Math.random() > 0.5 ? 0x86efac : 0x38bdf8;
      const fly = this.scene.add.circle(startX, startY, 2, color, 0.8).setDepth(285);
      this.particles.push(fly);

      this.scene.tweens.add({
        targets: fly,
        x: startX + (Math.random() * 40 - 20),
        y: startY + (Math.random() * 40 - 20),
        alpha: 0,
        duration: 3000,
        yoyo: true,
        repeat: 1,
        onComplete: () => fly.destroy(),
      });
    } else if (this.currentWeather === 'rain') {
      // Fast blue raindrop
      const drop = this.scene.add.circle(startX, startY, 1.5, 0x38bdf8, 0.6).setDepth(280);
      this.particles.push(drop);

      this.scene.tweens.add({
        targets: drop,
        x: startX - 30,
        y: startY + 220,
        duration: 400,
        onComplete: () => drop.destroy(),
      });
    } else if (this.currentWeather === 'mist') {
      // Atmospheric floating dungeon dust motes and glowing blue spores
      const isSpore = Math.random() > 0.65;
      const color = isSpore ? 0x38bdf8 : 0x94a3b8;
      const size = isSpore ? 2 : 1.5;
      const alpha = isSpore ? 0.65 : 0.35;
      const mote = this.scene.add.circle(startX, startY, size, color, alpha).setDepth(280);
      this.particles.push(mote);

      this.scene.tweens.add({
        targets: mote,
        x: startX + (Math.random() * 60 - 30),
        y: startY - (Math.random() * 50 + 20),
        alpha: 0,
        duration: 3000 + Math.random() * 2000,
        ease: 'Sine.easeOut',
        onComplete: () => mote.destroy(),
      });
    } else if (this.currentWeather === 'embers') {
      // Fiery glowing sparks near dungeon braziers
      const color = Math.random() > 0.4 ? 0xf97316 : 0xef4444;
      const ember = this.scene.add.circle(startX, startY, 1.5, color, 0.85).setDepth(285);
      this.particles.push(ember);

      this.scene.tweens.add({
        targets: ember,
        x: startX + (Math.random() * 30 - 15),
        y: startY - (Math.random() * 70 + 40),
        alpha: 0,
        duration: 1800 + Math.random() * 1000,
        ease: 'Quad.easeOut',
        onComplete: () => ember.destroy(),
      });
    }
  }

  clearAll() {
    this.particles.forEach((p) => p.destroy());
    this.particles = [];
  }
}
