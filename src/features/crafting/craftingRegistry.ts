export interface CraftingRecipe {
  id: string;
  resultDefId: string;
  resultQuantity: number;
  goldCost: number;
  echoShardCost: number;
  materials: { defId: string; quantity: number }[];
  nameEn: string;
  nameTh: string;
  category: 'weapons' | 'armors' | 'alchemy';
}

export const CRAFTING_RECIPES: CraftingRecipe[] = [
  {
    id: 'recipe_health_potion',
    resultDefId: 'item_health_potion',
    resultQuantity: 2,
    goldCost: 10,
    echoShardCost: 0,
    materials: [{ defId: 'item_slime_gel', quantity: 2 }],
    nameEn: 'Brew Minor Health Potions (x2)',
    nameTh: 'ปรุงยาฟื้นฟูพลังชีวิต (x2)',
    category: 'alchemy',
  },
  {
    id: 'recipe_mana_potion',
    resultDefId: 'item_mana_potion',
    resultQuantity: 2,
    goldCost: 15,
    echoShardCost: 0,
    materials: [{ defId: 'item_bat_wing', quantity: 2 }],
    nameEn: 'Brew Minor Mana Potions (x2)',
    nameTh: 'ปรุงยาฟื้นฟูมานา (x2)',
    category: 'alchemy',
  },
  {
    id: 'recipe_steel_blade',
    resultDefId: 'item_steel_blade',
    resultQuantity: 1,
    goldCost: 75,
    echoShardCost: 1,
    materials: [
      { defId: 'item_worn_sword', quantity: 1 },
      { defId: 'item_slime_gel', quantity: 3 },
      { defId: 'item_wolf_pelt', quantity: 2 },
    ],
    nameEn: 'Forge Everlight Broadsword',
    nameTh: 'ตีดาบใหญ่เหล็กกล้าเอเวอร์ไลท์',
    category: 'weapons',
  },
  {
    id: 'recipe_guardian_plate',
    resultDefId: 'item_guardian_cuirass',
    resultQuantity: 1,
    goldCost: 90,
    echoShardCost: 1,
    materials: [
      { defId: 'item_wanderer_jacket', quantity: 1 },
      { defId: 'item_wolf_pelt', quantity: 3 },
      { defId: 'item_bat_wing', quantity: 2 },
    ],
    nameEn: 'Forge Iron Sentinel Plate',
    nameTh: 'ตีเกราะเหล็กผู้พิทักษ์',
    category: 'armors',
  },
  {
    id: 'recipe_crystal_edge',
    resultDefId: 'item_crystal_edge',
    resultQuantity: 1,
    goldCost: 200,
    echoShardCost: 3,
    materials: [
      { defId: 'item_steel_blade', quantity: 1 },
      { defId: 'item_spore_cap', quantity: 3 },
      { defId: 'item_golem_core', quantity: 1 },
    ],
    nameEn: 'Infuse Echo Resonance Blade',
    nameTh: 'หลอมรวมดาบผลึกสะท้อนเอคโค่',
    category: 'weapons',
  },
];
