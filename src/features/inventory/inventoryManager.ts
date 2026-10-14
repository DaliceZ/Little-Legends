import { ItemInstance, CharacterStats } from '../../shared/types';
import { getItemDefinition } from '../items/itemRegistry';

export class InventoryManager {
  private static idCounter = 1;

  static createItemInstance(
    defId: string, 
    quantity: number = 1,
    enhancementLevel: number = 0
  ): ItemInstance | null {
    const def = getItemDefinition(defId);
    if (!def) return null;

    return {
      instanceId: `inst_${Date.now()}_${this.idCounter++}`,
      defId,
      quantity,
      rarity: def.rarity,
      enhancementLevel,
      affixes: [],
    };
  }

  /**
   * Adds an item instance to the inventory list, respecting stack limits.
   */
  static addItem(
    inventory: ItemInstance[],
    itemToAdd: ItemInstance,
    maxSlots: number = 24
  ): { success: boolean; updatedInventory: ItemInstance[]; reason?: string } {
    const def = getItemDefinition(itemToAdd.defId);
    if (!def) {
      return { success: false, updatedInventory: inventory, reason: 'Invalid item definition' };
    }

    const nextInv = [...inventory];

    // If stackable, try to add to existing stack
    if (def.stackable) {
      const existing = nextInv.find((i) => i.defId === itemToAdd.defId);
      if (existing) {
        const maxStack = def.maxStack || 99;
        const availableSpace = maxStack - existing.quantity;
        if (availableSpace >= itemToAdd.quantity) {
          existing.quantity += itemToAdd.quantity;
          return { success: true, updatedInventory: nextInv };
        } else {
          existing.quantity = maxStack;
          const remainder = itemToAdd.quantity - availableSpace;
          if (nextInv.length >= maxSlots) {
            return { success: false, updatedInventory: nextInv, reason: 'Inventory full' };
          }
          nextInv.push({ ...itemToAdd, quantity: remainder });
          return { success: true, updatedInventory: nextInv };
        }
      }
    }

    // Check inventory capacity
    if (nextInv.length >= maxSlots) {
      return { success: false, updatedInventory: inventory, reason: 'Inventory is full' };
    }

    nextInv.push(itemToAdd);
    return { success: true, updatedInventory: nextInv };
  }

  /**
   * Removes item instance or decrements quantity.
   */
  static removeItem(
    inventory: ItemInstance[],
    instanceId: string,
    quantityToRemove: number = 1
  ): { success: boolean; updatedInventory: ItemInstance[] } {
    const nextInv: ItemInstance[] = [];
    let found = false;

    for (const item of inventory) {
      if (item.instanceId === instanceId) {
        found = true;
        if (item.quantity > quantityToRemove) {
          nextInv.push({ ...item, quantity: item.quantity - quantityToRemove });
        }
        // if item.quantity <= quantityToRemove, item is removed entirely
      } else {
        nextInv.push(item);
      }
    }

    return { success: found, updatedInventory: nextInv };
  }

  /**
   * Calculates total stats contributed by currently equipped items.
   */
  static calculateEquipmentBonus(
    weapon?: ItemInstance,
    armor?: ItemInstance,
    accessory?: ItemInstance
  ): Partial<CharacterStats> {
    const bonus: Partial<CharacterStats> = {
      attack: 0,
      defense: 0,
      maxHp: 0,
      maxMp: 0,
      maxSp: 0,
      critChance: 0,
      critDamage: 0,
      speed: 0,
    };

    const equipped = [weapon, armor, accessory].filter(Boolean) as ItemInstance[];

    for (const item of equipped) {
      const def = getItemDefinition(item.defId);
      if (!def || !def.baseStats) continue;

      // Base stats + enhancement level multiplier (+10% per level)
      const enhanceMultiplier = 1 + item.enhancementLevel * 0.1;

      if (def.baseStats.attack) bonus.attack! += Math.round(def.baseStats.attack * enhanceMultiplier);
      if (def.baseStats.defense) bonus.defense! += Math.round(def.baseStats.defense * enhanceMultiplier);
      if (def.baseStats.maxHp) bonus.maxHp! += Math.round(def.baseStats.maxHp * enhanceMultiplier);
      if (def.baseStats.maxMp) bonus.maxMp! += Math.round(def.baseStats.maxMp * enhanceMultiplier);
      if (def.baseStats.critChance) bonus.critChance! += def.baseStats.critChance;
      if (def.baseStats.critDamage) bonus.critDamage! += def.baseStats.critDamage;
      if (def.baseStats.speed) bonus.speed! += def.baseStats.speed;

      // Affixes
      for (const affix of item.affixes) {
        if (typeof bonus[affix.stat] === 'number') {
          bonus[affix.stat]! += affix.value;
        }
      }
    }

    return bonus;
  }
}
