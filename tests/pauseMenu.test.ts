import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../src/app/store/useGameStore';

describe('ESC Pause Menu & Modal Priority Stack', () => {
  beforeEach(() => {
    useGameStore.setState({
      activeModal: 'none',
      currentDialogue: null,
      level: 3,
      gold: 150,
      stats: {
        hp: 100,
        maxHp: 120,
        mp: 30,
        maxMp: 50,
        sp: 80,
        maxSp: 100,
        attack: 20,
        defense: 10,
        critChance: 0.1,
        critDamage: 1.5,
        speed: 160,
      },
    });
  });

  it('sets activeModal to pause when opened', () => {
    const store = useGameStore.getState();
    expect(store.activeModal).toBe('none');

    store.openModal('pause');
    expect(useGameStore.getState().activeModal).toBe('pause');
  });

  it('resumes game by closing pause modal', () => {
    const store = useGameStore.getState();
    store.openModal('pause');
    expect(useGameStore.getState().activeModal).toBe('pause');

    store.closeModal();
    expect(useGameStore.getState().activeModal).toBe('none');
  });

  it('dialogue takes precedence in close stack', () => {
    const store = useGameStore.getState();
    store.setDialogue({ npcId: 'orin', nodeId: 'greeting' });
    expect(useGameStore.getState().currentDialogue).not.toBeNull();

    // Closing dialogue clears dialogue first
    store.closeDialogue();
    expect(useGameStore.getState().currentDialogue).toBeNull();
  });

  it('navigates from pause to settings modal', () => {
    const store = useGameStore.getState();
    store.openModal('pause');
    expect(useGameStore.getState().activeModal).toBe('pause');

    store.openModal('settings');
    expect(useGameStore.getState().activeModal).toBe('settings');

    store.closeModal();
    expect(useGameStore.getState().activeModal).toBe('none');
  });
});
