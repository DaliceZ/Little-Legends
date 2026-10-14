import { describe, it, expect } from 'vitest';
import { DungeonGenerator, SeededPRNG } from '../src/game/dungeon/DungeonGenerator';

describe('Procedural Dungeon Generator Engine', () => {
  it('generates identical maps given the exact same seed', () => {
    const seed = 42819;
    const mapA = DungeonGenerator.generate(seed, 1);
    const mapB = DungeonGenerator.generate(seed, 1);

    expect(mapA.width).toBe(mapB.width);
    expect(mapA.height).toBe(mapB.height);
    expect(mapA.entrance).toEqual(mapB.entrance);
    expect(mapA.bossPortal).toEqual(mapB.bossPortal);
    expect(mapA.tiles).toEqual(mapB.tiles);
    expect(mapA.rooms.length).toBe(mapB.rooms.length);
  });

  it('generates different layouts for different seeds', () => {
    const mapA = DungeonGenerator.generate(1001, 1);
    const mapB = DungeonGenerator.generate(9999, 1);

    expect(mapA.tiles).not.toEqual(mapB.tiles);
  });

  it('guarantees complete BFS connectivity from entrance to boss across 20 distinct seeds', () => {
    const testSeeds = [
      12, 57, 108, 256, 777, 1337, 2048, 4096, 8888, 12345,
      19842, 33333, 45678, 59123, 67890, 74125, 88210, 91234, 99999, 105234
    ];

    for (const seed of testSeeds) {
      const dungeon = DungeonGenerator.generate(seed, 1);
      const isConnected = DungeonGenerator.validateConnectivity(
        dungeon.tiles,
        dungeon.entrance,
        dungeon.bossPortal
      );

      expect(isConnected).toBe(true);
      // Entrance and boss tiles must be walkable (not walls)
      expect(dungeon.tiles[dungeon.entrance.y][dungeon.entrance.x]).not.toBe(2);
      expect(dungeon.tiles[dungeon.bossPortal.y][dungeon.bossPortal.x]).not.toBe(2);
    }
  });

  it('spawns treasure chests strictly inside walkable room coordinates', () => {
    const dungeon = DungeonGenerator.generate(777, 2);
    for (const room of dungeon.rooms) {
      if (room.chestSpawn) {
        const tile = dungeon.tiles[room.chestSpawn.y][room.chestSpawn.x];
        // Tile 1 is walkable floor
        expect(tile).toBe(1);
      }
    }
  });

  it('scales room count with dungeon tier', () => {
    const tier1 = DungeonGenerator.generate(500, 1);
    const tier3 = DungeonGenerator.generate(500, 3);

    expect(tier3.rooms.length).toBeGreaterThanOrEqual(tier1.rooms.length);
  });

  it('produces deterministic numbers from SeededPRNG', () => {
    const rng1 = new SeededPRNG(9876);
    const rng2 = new SeededPRNG(9876);

    const seq1 = [rng1.next(), rng1.next(), rng1.range(5, 50)];
    const seq2 = [rng2.next(), rng2.next(), rng2.range(5, 50)];

    expect(seq1).toEqual(seq2);
  });
});
