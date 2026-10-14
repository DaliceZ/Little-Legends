export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type RoomType = 'entrance' | 'combat' | 'treasure' | 'boss';

export interface DungeonRoom {
  id: number;
  type: RoomType;
  rect: Rect;
  center: Point;
  enemySpawns: { x: number; y: number; type: 'slime' | 'bat' | 'wolf' | 'mushroom' | 'golem' }[];
  chestSpawn?: Point;
}

export interface DungeonMap {
  seed: number;
  width: number;
  height: number;
  tiles: number[][]; // 0: void, 1: floor, 2: wall, 3: entrance, 4: boss portal
  rooms: DungeonRoom[];
  entrance: Point;
  bossPortal: Point;
}

// Deterministic Pseudo-Random Number Generator (Mulberry32)
export class SeededPRNG {
  private s: number;

  constructor(seed: number) {
    this.s = seed >>> 0;
  }

  next(): number {
    let t = (this.s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
}

export class DungeonGenerator {
  static generate(seed: number = 1337, tier: number = 1): DungeonMap {
    const prng = new SeededPRNG(seed);
    const mapWidth = 56;
    const mapHeight = 56;

    // Initialize map filled with void/wall
    const tiles: number[][] = Array.from({ length: mapHeight }, () =>
      Array(mapWidth).fill(2)
    );

    const rooms: DungeonRoom[] = [];
    const targetRoomCount = 6 + Math.min(4, tier);

    // 1. Create Entrance Room
    const entranceRect: Rect = { x: 4, y: 4, width: 8, height: 8 };
    const entranceRoom: DungeonRoom = {
      id: 0,
      type: 'entrance',
      rect: entranceRect,
      center: { x: entranceRect.x + 4, y: entranceRect.y + 4 },
      enemySpawns: [],
    };
    rooms.push(entranceRoom);

    // 2. Generate Intermediate Combat & Treasure Rooms
    for (let i = 1; i < targetRoomCount - 1; i++) {
      const w = prng.range(8, 12);
      const h = prng.range(8, 12);
      // Stagger rooms across the map
      const col = (i - 1) % 2;
      const row = Math.floor((i - 1) / 2);
      const minX = 14 + col * 18;
      const minY = 4 + row * 16;
      const rx = prng.range(minX, Math.min(mapWidth - w - 4, minX + 6));
      const ry = prng.range(minY, Math.min(mapHeight - h - 16, minY + 6));

      const isTreasure = i === 2 || (i === 4 && prng.next() > 0.4);
      const roomType: RoomType = isTreasure ? 'treasure' : 'combat';

      const roomRect: Rect = { x: rx, y: ry, width: w, height: h };
      const center: Point = { x: Math.floor(rx + w / 2), y: Math.floor(ry + h / 2) };

      const enemySpawns: DungeonRoom['enemySpawns'] = [];
      if (roomType === 'combat') {
        const enemyCount = prng.range(2, 4);
        const types: ('slime' | 'bat' | 'wolf' | 'mushroom')[] = ['slime', 'bat', 'wolf', 'mushroom'];
        for (let e = 0; e < enemyCount; e++) {
          enemySpawns.push({
            x: center.x + prng.range(-2, 2),
            y: center.y + prng.range(-2, 2),
            type: types[prng.range(0, Math.min(types.length - 1, tier))],
          });
        }
      }

      rooms.push({
        id: i,
        type: roomType,
        rect: roomRect,
        center,
        enemySpawns,
        chestSpawn: isTreasure ? { x: center.x, y: center.y } : undefined,
      });
    }

    // 3. Create Boss Chamber at the far end
    const bossW = 14;
    const bossH = 14;
    const bossX = mapWidth - bossW - 4;
    const bossY = mapHeight - bossH - 4;
    const bossCenter: Point = { x: bossX + 7, y: bossY + 7 };

    const bossRoom: DungeonRoom = {
      id: rooms.length,
      type: 'boss',
      rect: { x: bossX, y: bossY, width: bossW, height: bossH },
      center: bossCenter,
      enemySpawns: [{ x: bossCenter.x, y: bossCenter.y, type: 'golem' }],
      chestSpawn: { x: bossCenter.x + 3, y: bossCenter.y + 3 },
    };
    rooms.push(bossRoom);

    // 4. Carve Rooms into Tile Grid
    for (const room of rooms) {
      for (let y = room.rect.y; y < room.rect.y + room.rect.height; y++) {
        for (let x = room.rect.x; x < room.rect.x + room.rect.width; x++) {
          if (x >= 0 && x < mapWidth && y >= 0 && y < mapHeight) {
            tiles[y][x] = 1; // Floor
          }
        }
      }
    }

    // 5. Connect Sequential Rooms with Corridors (L-shaped)
    for (let i = 0; i < rooms.length - 1; i++) {
      const from = rooms[i].center;
      const to = rooms[i + 1].center;
      this.carveCorridor(tiles, from, to);
    }

    // Entrance and Portal marker tiles
    const entrance = entranceRoom.center;
    const bossPortal = { x: bossCenter.x, y: bossCenter.y - 3 };
    tiles[entrance.y][entrance.x] = 3; // Entrance portal
    tiles[bossPortal.y][bossPortal.x] = 4; // Exit/Altar

    // Validate Connectivity
    const isConnected = this.validateConnectivity(tiles, entrance, bossPortal);
    if (!isConnected) {
      // Direct emergency corridor if somehow disconnected
      this.carveCorridor(tiles, entrance, bossPortal);
    }

    return {
      seed,
      width: mapWidth,
      height: mapHeight,
      tiles,
      rooms,
      entrance,
      bossPortal,
    };
  }

  private static carveCorridor(tiles: number[][], from: Point, to: Point) {
    let curX = from.x;
    let curY = from.y;

    // Horizontal then vertical
    while (curX !== to.x) {
      tiles[curY][curX] = 1;
      tiles[Math.min(tiles.length - 1, curY + 1)][curX] = 1; // 2-wide corridor
      curX += curX < to.x ? 1 : -1;
    }
    while (curY !== to.y) {
      tiles[curY][curX] = 1;
      tiles[curY][Math.min(tiles[0].length - 1, curX + 1)] = 1;
      curY += curY < to.y ? 1 : -1;
    }
  }

  /**
   * Breadth-First Search (BFS) to guarantee path between entrance and boss chamber.
   */
  static validateConnectivity(tiles: number[][], start: Point, target: Point): boolean {
    const height = tiles.length;
    const width = tiles[0].length;
    const visited = Array.from({ length: height }, () => Array(width).fill(false));

    const queue: Point[] = [start];
    visited[start.y][start.x] = true;

    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];

    while (queue.length > 0) {
      const cur = queue.shift()!;
      if (cur.x === target.x && cur.y === target.y) {
        return true;
      }

      for (const d of directions) {
        const nx = cur.x + d.x;
        const ny = cur.y + d.y;

        if (
          nx >= 0 &&
          nx < width &&
          ny >= 0 &&
          ny < height &&
          !visited[ny][nx] &&
          tiles[ny][nx] !== 2 // Not a wall
        ) {
          visited[ny][nx] = true;
          queue.push({ x: nx, y: ny });
        }
      }
    }

    return false;
  }
}
