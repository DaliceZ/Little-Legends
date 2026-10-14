import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Phaser for headless unit tests
vi.mock('phaser', () => {
  return {
    default: {
      Math: {
        Distance: {
          Between: (x1: number, y1: number, x2: number, y2: number) => {
            const dx = x1 - x2;
            const dy = y1 - y2;
            return Math.sqrt(dx * dx + dy * dy);
          },
        },
      },
      GameObjects: {
        Container: class MockContainer {
          scene: any;
          x: number;
          y: number;
          constructor(scene: any, x: number = 0, y: number = 0) {
            this.scene = scene;
            this.x = x;
            this.y = y;
          }
          add() { return this; }
          destroy() {}
          setPosition(x: number, y: number) { this.x = x; this.y = y; return this; }
          setDepth() { return this; }
          setVisible() { return this; }
        },
        Sprite: class MockSprite {},
        Text: class MockText {},
        Ellipse: class MockEllipse {},
      },
      Physics: {
        Arcade: {
          Sprite: class MockArcadeSprite {},
        },
      },
      Scene: class MockScene {},
    },
  };
});
