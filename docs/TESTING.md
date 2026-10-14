# Testing Strategy & Automated Test Plan
# Little Legends: Endless World

## 1. Testing Philosophy

Game systems are engineered in decoupled domain modules. This allows pure algorithmic unit testing without browser canvas rendering overhead.

### Layer 1: Unit Tests (Vitest)
- **Combat Formulas**: Base damage calculations, armor mitigation curves, critical strike probability and damage caps.
- **Inventory & Items**: Slot capacity, item stacking limits, equipment stat changes, invalid item handling.
- **Quest State Machine**: Stage transitions (`AVAILABLE` -> `ACTIVE` -> `COMPLETED` -> `REWARD_CLAIMED`), objective fulfillment, idempotency of reward grants.
- **Procedural Dungeon Generator**: Seed reproducibility, room connectivity validation via Breadth-First Search (BFS), entrance-to-boss accessibility, prevention of unreachable objectives.
- **Crafting & Economy**: Recipe verification, gold balance checks, negative balance prevention.

### Layer 2: Integration Tests
- **Save/Load Integrity**: Exporting state to IndexedDB and verifying exact byte-for-byte state restoration.
- **React-Phaser Bridge**: Verifying EventBus triggers update Zustand store and trigger HUD updates.

### Layer 3: Running Tests
```bash
# Run Vitest test suite
npm test

# Run type checker
npm run typecheck
```
