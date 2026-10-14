import { describe, it, expect } from 'vitest';
import { InventoryManager } from '../src/features/inventory/inventoryManager';
import { ItemInstance } from '../src/shared/types';

describe('Inventory Manager & Equipment Engine', () => {
  it('creates an item instance from item definition', () => {
    const item = InventoryManager.createItemInstance('item_worn_sword', 1);
    expect(item).not.toBeNull();
    expect(item?.defId).toBe('item_worn_sword');
    expect(item?.quantity).toBe(1);
    expect(item?.rarity).toBe('common');
    expect(item?.enhancementLevel).toBe(0);
  });

  it('stacks stackable consumable items together', () => {
    const initialInv: ItemInstance[] = [
      InventoryManager.createItemInstance('item_health_potion', 3)!,
    ];

    const toAdd = InventoryManager.createItemInstance('item_health_potion', 2)!;
    const result = InventoryManager.addItem(initialInv, toAdd, 24);

    expect(result.success).toBe(true);
    expect(result.updatedInventory.length).toBe(1);
    expect(result.updatedInventory[0].quantity).toBe(5);
  });

  it('does not stack unstackable weapons together', () => {
    const initialInv: ItemInstance[] = [
      InventoryManager.createItemInstance('item_worn_sword', 1)!,
    ];

    const toAdd = InventoryManager.createItemInstance('item_worn_sword', 1)!;
    const result = InventoryManager.addItem(initialInv, toAdd, 24);

    expect(result.success).toBe(true);
    expect(result.updatedInventory.length).toBe(2);
  });

  it('rejects adding items when inventory capacity is exceeded', () => {
    const maxCapacity = 2;
    const initialInv: ItemInstance[] = [
      InventoryManager.createItemInstance('item_worn_sword', 1)!,
      InventoryManager.createItemInstance('item_wanderer_jacket', 1)!,
    ];

    const extra = InventoryManager.createItemInstance('item_echo_pendant', 1)!;
    const result = InventoryManager.addItem(initialInv, extra, maxCapacity);

    expect(result.success).toBe(false);
    expect(result.reason).toContain('full');
    expect(result.updatedInventory.length).toBe(2);
  });

  it('removes item completely when quantity reaches zero', () => {
    const item = InventoryManager.createItemInstance('item_health_potion', 1)!;
    const initialInv = [item];

    const result = InventoryManager.removeItem(initialInv, item.instanceId, 1);
    expect(result.success).toBe(true);
    expect(result.updatedInventory.length).toBe(0);
  });

  it('decrements stack quantity when partially removing', () => {
    const item = InventoryManager.createItemInstance('item_health_potion', 5)!;
    const initialInv = [item];

    const result = InventoryManager.removeItem(initialInv, item.instanceId, 2);
    expect(result.success).toBe(true);
    expect(result.updatedInventory.length).toBe(1);
    expect(result.updatedInventory[0].quantity).toBe(3);
  });

  it('calculates total equipment stat bonuses with enhancement levels', () => {
    // Base sword has 12 Attack. At +2 enhancement (+20%), it should grant 14 Attack.
    const sword = InventoryManager.createItemInstance('item_worn_sword', 1, 2)!;
    // Base jacket has 6 Defense, 15 HP. At +0 enhancement, it grants 6 Defense, 15 HP.
    const jacket = InventoryManager.createItemInstance('item_wanderer_jacket', 1, 0)!;

    const bonus = InventoryManager.calculateEquipmentBonus(sword, jacket);
    expect(bonus.attack).toBe(14); // 12 * 1.2 = 14.4 -> 14
    expect(bonus.defense).toBe(6);
    expect(bonus.maxHp).toBe(15);
  });
});
