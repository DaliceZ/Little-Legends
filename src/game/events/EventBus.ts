type Listener<T = any> = (data: T) => void;

class TypedEventBus {
  private listeners: Map<string, Set<Listener>> = new Map();

  on<T = any>(event: string, callback: Listener<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function for clean React useEffect cleanup
    return () => {
      this.off(event, callback);
    };
  }

  off<T = any>(event: string, callback: Listener<T>): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  emit<T = any>(event: string, data?: T): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(data);
        } catch (err) {
          console.error(`[EventBus] Error in handler for event "${event}":`, err);
        }
      });
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new TypedEventBus();

// Strongly typed event names
export const GameEvents = {
  PLAYER_STATS_UPDATED: 'PLAYER_STATS_UPDATED',
  SHOW_NOTIFICATION: 'SHOW_NOTIFICATION',
  OPEN_DIALOGUE: 'OPEN_DIALOGUE',
  CLOSE_DIALOGUE: 'CLOSE_DIALOGUE',
  OPEN_MODAL: 'OPEN_MODAL',
  CLOSE_MODAL: 'CLOSE_MODAL',
  ITEM_COLLECTED: 'ITEM_COLLECTED',
  INVENTORY_CHANGED: 'INVENTORY_CHANGED',
  QUEST_UPDATED: 'QUEST_UPDATED',
  ZONE_CHANGED: 'ZONE_CHANGED',
  PLAYER_DIED: 'PLAYER_DIED',
  PLAYER_RESPAWN: 'PLAYER_RESPAWN',
  PLAY_SFX: 'PLAY_SFX',
  SCREEN_SHAKE: 'SCREEN_SHAKE',
  INTERACT_TRIGGERED: 'INTERACT_TRIGGERED',
  USE_ACTIVE_SKILL: 'USE_ACTIVE_SKILL',
} as const;
