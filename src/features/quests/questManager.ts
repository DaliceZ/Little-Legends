import { QuestState, QuestStatus, ItemInstance } from '../../shared/types';
import { getQuestDefinition } from './questRegistry';

export class QuestManager {
  /**
   * Initializes a new active quest.
   */
  static startQuest(questId: string): QuestState | null {
    const def = getQuestDefinition(questId);
    if (!def) return null;

    return {
      questId,
      status: 'active',
      objectives: def.objectives.map((obj) => ({
        id: obj.id,
        currentCount: 0,
      })),
    };
  }

  /**
   * Updates objective progress for monster kills or boss defeats.
   */
  static recordKill(quests: QuestState[], enemyType: string): { updatedQuests: QuestState[]; anyCompleted: boolean } {
    let anyCompleted = false;

    const nextQuests = quests.map((q) => {
      if (q.status !== 'active') return q;
      const def = getQuestDefinition(q.questId);
      if (!def) return q;

      let changed = false;
      const nextObjectives = q.objectives.map((objState) => {
        const objDef = def.objectives.find((o) => o.id === objState.id);
        if (!objDef) return objState;

        if (
          (objDef.type === 'defeat_enemies' || objDef.type === 'defeat_boss') &&
          objDef.targetId === enemyType &&
          objState.currentCount < objDef.targetCount
        ) {
          changed = true;
          return { ...objState, currentCount: objState.currentCount + 1 };
        }
        return objState;
      });

      if (!changed) return q;

      // Check if all objectives are completed
      const allDone = nextObjectives.every((objState) => {
        const objDef = def.objectives.find((o) => o.id === objState.id);
        return objDef && objState.currentCount >= objDef.targetCount;
      });

      if (allDone) {
        anyCompleted = true;
        return {
          ...q,
          status: 'completed' as QuestStatus,
          objectives: nextObjectives,
        };
      }

      return {
        ...q,
        objectives: nextObjectives,
      };
    });

    return { updatedQuests: nextQuests, anyCompleted };
  }

  /**
   * Syncs material collection objectives with current inventory.
   */
  static syncMaterialProgress(quests: QuestState[], inventory: ItemInstance[]): { updatedQuests: QuestState[]; anyCompleted: boolean } {
    let anyCompleted = false;

    const nextQuests = quests.map((q) => {
      if (q.status !== 'active') return q;
      const def = getQuestDefinition(q.questId);
      if (!def) return q;

      const nextObjectives = q.objectives.map((objState) => {
        const objDef = def.objectives.find((o) => o.id === objState.id);
        if (!objDef || objDef.type !== 'collect_materials') return objState;

        // Count total matching items in inventory
        const totalCount = inventory
          .filter((item) => item.defId === objDef.targetId)
          .reduce((sum, item) => sum + item.quantity, 0);

        return {
          ...objState,
          currentCount: Math.min(objDef.targetCount, totalCount),
        };
      });

      const allDone = nextObjectives.every((objState) => {
        const objDef = def.objectives.find((o) => o.id === objState.id);
        return objDef && objState.currentCount >= objDef.targetCount;
      });

      if (allDone && q.status === 'active') {
        anyCompleted = true;
        return {
          ...q,
          status: 'completed' as QuestStatus,
          objectives: nextObjectives,
        };
      }

      return {
        ...q,
        objectives: nextObjectives,
      };
    });

    return { updatedQuests: nextQuests, anyCompleted };
  }
}
