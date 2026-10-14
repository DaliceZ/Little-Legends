import { describe, it, expect } from 'vitest';
import { QuestManager } from '../src/features/quests/questManager';
import { InventoryManager } from '../src/features/inventory/inventoryManager';

describe('Quest State Machine & Progression Engine', () => {
  it('initializes a new quest with zeroed objective counters', () => {
    const quest = QuestManager.startQuest('quest_cleansing_forest');
    expect(quest).not.toBeNull();
    expect(quest?.status).toBe('active');
    expect(quest?.objectives.length).toBe(2);
    expect(quest?.objectives[0].currentCount).toBe(0);
    expect(quest?.objectives[1].currentCount).toBe(0);
  });

  it('increments kill count on matching monster defeats', () => {
    const quest = QuestManager.startQuest('quest_cleansing_forest')!;
    const quests = [quest];

    const result = QuestManager.recordKill(quests, 'slime');
    const updated = result.updatedQuests[0];

    const slimeObj = updated.objectives.find((o) => o.id === 'obj_slimes');
    expect(slimeObj?.currentCount).toBe(1);
    expect(updated.status).toBe('active');
  });

  it('marks quest as completed when all objectives reach target count', () => {
    let quests = [QuestManager.startQuest('quest_cleansing_forest')!];

    // Kill 4 slimes
    for (let i = 0; i < 4; i++) {
      quests = QuestManager.recordKill(quests, 'slime').updatedQuests;
    }
    // Kill 2 bats
    for (let i = 0; i < 2; i++) {
      const res = QuestManager.recordKill(quests, 'bat');
      quests = res.updatedQuests;
      if (i === 1) {
        expect(res.anyCompleted).toBe(true);
      }
    }

    expect(quests[0].status).toBe('completed');
  });

  it('syncs material collection objectives with inventory items', () => {
    const quest = QuestManager.startQuest('quest_mira_herbs')!;
    const inventory = [
      InventoryManager.createItemInstance('item_slime_gel', 4)!,
    ];

    const { updatedQuests, anyCompleted } = QuestManager.syncMaterialProgress([quest], inventory);
    expect(anyCompleted).toBe(true);
    expect(updatedQuests[0].status).toBe('completed');
    expect(updatedQuests[0].objectives[0].currentCount).toBe(4);
  });
});
