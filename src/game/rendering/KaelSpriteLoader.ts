import Phaser from 'phaser';

export class KaelSpriteLoader {
  private static portraitDataUrl: string = '';

  static getPortraitDataUrl(): string {
    return this.portraitDataUrl;
  }

  /**
   * Loads the new Dragonkin Hero sprite sheet, removes the dark background with
   * color-keying, extracts the portrait, slices animation frames, and registers them in Phaser.
   */
  static loadKaelSheet(scene: Phaser.Scene): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = '/assets/dragon_warrior.jpg';

      img.onload = () => {
        try {
          const rawCanvas = document.createElement('canvas');
          const rawW = img.naturalWidth || 1376;
          const rawH = img.naturalHeight || 768;
          rawCanvas.width = rawW;
          rawCanvas.height = rawH;
          const ctx = rawCanvas.getContext('2d', { willReadFrequently: true })!;
          ctx.drawImage(img, 0, 0);

          // 1. Color-keying: sample the background dark grey from top-left corner
          const bgSample = ctx.getImageData(5, 5, 1, 1).data;
          const bgR = bgSample[0];
          const bgG = bgSample[1];
          const bgB = bgSample[2];

          // 2. Extract and register Dragonkin Portrait (Top-Left area, 310x315)
          const portraitCanvas = document.createElement('canvas');
          portraitCanvas.width = 300;
          portraitCanvas.height = 300;
          const pCtx = portraitCanvas.getContext('2d')!;
          pCtx.imageSmoothingEnabled = false;
          // Crop portrait excluding the "PORTRAIT" text header
          pCtx.drawImage(rawCanvas, 35, 60, 310, 315, 0, 0, 300, 300);
          this.removeBackground(pCtx, 300, 300, bgR, bgG, bgB);

          // Save Data URL for React HUD and Modals
          this.portraitDataUrl = portraitCanvas.toDataURL('image/png');
          if (scene.textures.exists('kael_portrait')) {
            scene.textures.remove('kael_portrait');
          }
          scene.textures.addCanvas('kael_portrait', portraitCanvas);

          // 3. Slice Character Sprites
          // Standardized Target Sprite Size in Game: 42x48 pixels
          const targetW = 42;
          const targetH = 48;

          const sliceFrame = (sx: number, sy: number, sw: number, sh: number, flipX: boolean = false): HTMLCanvasElement => {
            const frameCanvas = document.createElement('canvas');
            frameCanvas.width = targetW;
            frameCanvas.height = targetH;
            const fCtx = frameCanvas.getContext('2d')!;
            fCtx.imageSmoothingEnabled = false;

            if (flipX) {
              fCtx.translate(targetW, 0);
              fCtx.scale(-1, 1);
            }

            fCtx.drawImage(rawCanvas, sx, sy, sw, sh, 0, 0, targetW, targetH);
            this.removeBackground(fCtx, targetW, targetH, bgR, bgG, bgB);
            return frameCanvas;
          };

          const registerTexture = (key: string, canvas: HTMLCanvasElement) => {
            if (scene.textures.exists(key)) {
              scene.textures.remove(key);
            }
            scene.textures.addCanvas(key, canvas);
          };

          // Idle frames
          const idleRight = sliceFrame(400, 70, 230, 310, false);
          const idleLeft = sliceFrame(400, 70, 230, 310, true);
          registerTexture('kael_idle_down', idleRight);
          registerTexture('kael_idle_right', idleRight);
          registerTexture('kael_idle_left', idleLeft);
          registerTexture('kael_idle_up', idleRight);

          // Walk frames (Right and Left)
          const walkF0_R = sliceFrame(400, 70, 230, 310, false);
          const walkF1_R = sliceFrame(740, 70, 240, 310, false);
          const walkF2_R = sliceFrame(1040, 70, 260, 310, false);
          const walkF3_R = sliceFrame(740, 70, 240, 310, false);

          const walkF0_L = sliceFrame(400, 70, 230, 310, true);
          const walkF1_L = sliceFrame(740, 70, 240, 310, true);
          const walkF2_L = sliceFrame(1040, 70, 260, 310, true);
          const walkF3_L = sliceFrame(740, 70, 240, 310, true);

          registerTexture('kael_walk_r_0', walkF0_R);
          registerTexture('kael_walk_r_1', walkF1_R);
          registerTexture('kael_walk_r_2', walkF2_R);
          registerTexture('kael_walk_r_3', walkF3_R);

          registerTexture('kael_walk_l_0', walkF0_L);
          registerTexture('kael_walk_l_1', walkF1_L);
          registerTexture('kael_walk_l_2', walkF2_L);
          registerTexture('kael_walk_l_3', walkF3_L);

          // Attack frames (Ready, Flaming Slash Arc, Finish)
          const slash0_R = sliceFrame(40, 450, 320, 295, false);
          const slash1_R = sliceFrame(380, 445, 420, 300, false);
          const slash2_R = sliceFrame(400, 70, 230, 310, false);

          const slash0_L = sliceFrame(40, 450, 320, 295, true);
          const slash1_L = sliceFrame(380, 445, 420, 300, true);
          const slash2_L = sliceFrame(400, 70, 230, 310, true);

          registerTexture('kael_slash_r_0', slash0_R);
          registerTexture('kael_slash_r_1', slash1_R);
          registerTexture('kael_slash_r_2', slash2_R);

          registerTexture('kael_slash_l_0', slash0_L);
          registerTexture('kael_slash_l_1', slash1_L);
          registerTexture('kael_slash_l_2', slash2_L);

          // Dodge / Dash frames
          const roll0_R = sliceFrame(840, 450, 210, 295, false);
          const roll1_R = sliceFrame(1050, 445, 280, 300, false);

          const roll0_L = sliceFrame(840, 450, 210, 295, true);
          const roll1_L = sliceFrame(1050, 445, 280, 300, true);

          registerTexture('kael_roll_r_0', roll0_R);
          registerTexture('kael_roll_r_1', roll1_R);
          registerTexture('kael_roll_l_0', roll0_L);
          registerTexture('kael_roll_l_1', roll1_L);

          // 4. Register directional animations in Phaser
          this.registerAnimations(scene);
          resolve();
        } catch (e) {
          console.warn('Failed to parse Dragonkin sprite sheet, fallback to procedural textures:', e);
          resolve();
        }
      };

      img.onerror = () => {
        console.warn('Could not load /assets/dragon_warrior.jpg, falling back to procedural textures.');
        resolve();
      };
    });
  }

  /**
   * Exterior-only BFS Flood-Fill transparency:
   * Only background pixels contiguous to the outer borders are cleared.
   * Internal dark areas (obsidian horns, dark armor, boots, dark hair) are 100% preserved.
   */
  private static removeBackground(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    targetR: number,
    targetG: number,
    targetB: number
  ) {
    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    const threshold = 36;
    const visited = new Uint8Array(w * h);
    const queue: number[] = [];

    // Helper to test if a pixel matches background
    const isBg = (idx: number): boolean => {
      const p = idx * 4;
      const r = data[p];
      const g = data[p + 1];
      const b = data[p + 2];
      const dist = Math.sqrt(
        (r - targetR) * (r - targetR) +
        (g - targetG) * (g - targetG) +
        (b - targetB) * (b - targetB)
      );
      return dist < threshold;
    };

    // Seed perimeter pixels
    for (let x = 0; x < w; x++) {
      // Top row
      const topIdx = x;
      if (isBg(topIdx)) {
        visited[topIdx] = 1;
        data[topIdx * 4 + 3] = 0;
        queue.push(topIdx);
      }
      // Bottom row
      const btmIdx = (h - 1) * w + x;
      if (isBg(btmIdx)) {
        visited[btmIdx] = 1;
        data[btmIdx * 4 + 3] = 0;
        queue.push(btmIdx);
      }
    }

    for (let y = 0; y < h; y++) {
      // Left col
      const leftIdx = y * w;
      if (!visited[leftIdx] && isBg(leftIdx)) {
        visited[leftIdx] = 1;
        data[leftIdx * 4 + 3] = 0;
        queue.push(leftIdx);
      }
      // Right col
      const rightIdx = y * w + (w - 1);
      if (!visited[rightIdx] && isBg(rightIdx)) {
        visited[rightIdx] = 1;
        data[rightIdx * 4 + 3] = 0;
        queue.push(rightIdx);
      }
    }

    // BFS Queue processing
    let head = 0;
    while (head < queue.length) {
      const curr = queue[head++];
      const cx = curr % w;
      const cy = Math.floor(curr / w);

      // Check 4 neighbors
      const neighbors = [
        cx > 0 ? curr - 1 : -1,
        cx < w - 1 ? curr + 1 : -1,
        cy > 0 ? curr - w : -1,
        cy < h - 1 ? curr + w : -1,
      ];

      for (const n of neighbors) {
        if (n !== -1 && !visited[n] && isBg(n)) {
          visited[n] = 1;
          data[n * 4 + 3] = 0;
          queue.push(n);
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  private static registerAnimations(scene: Phaser.Scene) {
    // 1. Walk animations
    const walkRightFrames = [
      { key: 'kael_walk_r_0' },
      { key: 'kael_walk_r_1' },
      { key: 'kael_walk_r_2' },
      { key: 'kael_walk_r_3' },
    ];
    const walkLeftFrames = [
      { key: 'kael_walk_l_0' },
      { key: 'kael_walk_l_1' },
      { key: 'kael_walk_l_2' },
      { key: 'kael_walk_l_3' },
    ];

    ['down', 'right', 'up'].forEach((dir) => {
      if (scene.anims.exists(`kael_walk_${dir}`)) scene.anims.remove(`kael_walk_${dir}`);
      scene.anims.create({
        key: `kael_walk_${dir}`,
        frames: walkRightFrames.filter((k) => scene.textures.exists(k.key)),
        frameRate: 8,
        repeat: -1,
      });
    });

    if (scene.anims.exists('kael_walk_left')) scene.anims.remove('kael_walk_left');
    scene.anims.create({
      key: 'kael_walk_left',
      frames: walkLeftFrames.filter((k) => scene.textures.exists(k.key)),
      frameRate: 8,
      repeat: -1,
    });

    // 2. Attack animations
    const attackRightFrames = [
      { key: 'kael_slash_r_0' },
      { key: 'kael_slash_r_1' },
      { key: 'kael_slash_r_2' },
    ];
    const attackLeftFrames = [
      { key: 'kael_slash_l_0' },
      { key: 'kael_slash_l_1' },
      { key: 'kael_slash_l_2' },
    ];

    ['down', 'right', 'up'].forEach((dir) => {
      if (scene.anims.exists(`kael_attack_${dir}`)) scene.anims.remove(`kael_attack_${dir}`);
      scene.anims.create({
        key: `kael_attack_${dir}`,
        frames: attackRightFrames.filter((k) => scene.textures.exists(k.key)),
        frameRate: 12,
        repeat: 0,
      });
    });

    if (scene.anims.exists('kael_attack_left')) scene.anims.remove('kael_attack_left');
    scene.anims.create({
      key: 'kael_attack_left',
      frames: attackLeftFrames.filter((k) => scene.textures.exists(k.key)),
      frameRate: 12,
      repeat: 0,
    });

    // 3. Dodge / Dash animations
    const dodgeRightFrames = [
      { key: 'kael_roll_r_0' },
      { key: 'kael_roll_r_1' },
    ];
    const dodgeLeftFrames = [
      { key: 'kael_roll_l_0' },
      { key: 'kael_roll_l_1' },
    ];

    ['down', 'right', 'up'].forEach((dir) => {
      if (scene.anims.exists(`kael_dodge_${dir}`)) scene.anims.remove(`kael_dodge_${dir}`);
      scene.anims.create({
        key: `kael_dodge_${dir}`,
        frames: dodgeRightFrames.filter((k) => scene.textures.exists(k.key)),
        frameRate: 10,
        repeat: 0,
      });
    });

    if (scene.anims.exists('kael_dodge_left')) scene.anims.remove('kael_dodge_left');
    scene.anims.create({
      key: 'kael_dodge_left',
      frames: dodgeLeftFrames.filter((k) => scene.textures.exists(k.key)),
      frameRate: 10,
      repeat: 0,
    });
  }
}
