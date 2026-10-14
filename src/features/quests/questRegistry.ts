import { QuestDefinition } from '../../shared/types';

export const QUEST_REGISTRY: Record<string, QuestDefinition> = {
  quest_cleansing_forest: {
    id: 'quest_cleansing_forest',
    titleEn: 'Cleansing the Outskirts',
    titleTh: 'กวาดล้างชายป่าเสียงกระซิบ',
    descriptionEn: 'Elder Orin asked you to eliminate menacing slimes and bats near the village border.',
    descriptionTh: 'ผู้เฒ่าโอรินขอให้เจ้าช่วยกำจัดสไลม์และค้างคาวที่มารบกวนบริเวณแนวชายป่า',
    giverNpcId: 'orin',
    minLevel: 1,
    objectives: [
      {
        id: 'obj_slimes',
        type: 'defeat_enemies',
        targetId: 'slime',
        targetCount: 4,
        currentCount: 0,
        descriptionEn: 'Defeat Forest Slimes (0/4)',
        descriptionTh: 'กำจัดสไลม์พงไพร (0/4)',
      },
      {
        id: 'obj_bats',
        type: 'defeat_enemies',
        targetId: 'bat',
        targetCount: 2,
        currentCount: 0,
        descriptionEn: 'Defeat Forest Bats (0/2)',
        descriptionTh: 'กำจัดค้างคาวป่า (0/2)',
      },
    ],
    rewards: {
      exp: 150,
      gold: 60,
      echoShards: 1,
      items: [{ defId: 'item_health_potion', quantity: 2 }],
    },
  },
  quest_mira_herbs: {
    id: 'quest_mira_herbs',
    titleEn: 'Mira’s Medicine Supplies',
    titleTh: 'วัตถุดิบปรุงยาของมิรา',
    descriptionEn: 'Gather 4 jars of Slime Jelly from forest creatures so Mira can brew healing salves.',
    descriptionTh: 'รวบรวมเมือกสไลม์ 4 ชิ้นจากสิ่งมีชีวิตในป่า เพื่อให้มิรานำไปปรุงยาสมานแผล',
    giverNpcId: 'mira',
    minLevel: 1,
    objectives: [
      {
        id: 'obj_jelly',
        type: 'collect_materials',
        targetId: 'item_slime_gel',
        targetCount: 4,
        currentCount: 0,
        descriptionEn: 'Collect Slime Jelly (0/4)',
        descriptionTh: 'เก็บเมือกสไลม์ (0/4)',
      },
    ],
    rewards: {
      exp: 120,
      gold: 50,
      echoShards: 1,
      items: [
        { defId: 'item_health_potion', quantity: 3 },
        { defId: 'item_mana_potion', quantity: 2 },
      ],
    },
  },
  quest_rowan_pelts: {
    id: 'quest_rowan_pelts',
    titleEn: 'Tough Wolf Pelts',
    titleTh: 'หนังหมาป่าสุดแกร่ง',
    descriptionEn: 'Rowan needs 2 Wild Wolf Pelts to forge reinforced padding for adventurer armor.',
    descriptionTh: 'โรแวนต้องการหนังหมาป่าพงไพร 2 ผืน เพื่อใช้บุเกราะเสริมความทนทาน',
    giverNpcId: 'rowan',
    minLevel: 2,
    objectives: [
      {
        id: 'obj_pelts',
        type: 'collect_materials',
        targetId: 'item_wolf_pelt',
        targetCount: 2,
        currentCount: 0,
        descriptionEn: 'Collect Wild Wolf Pelts (0/2)',
        descriptionTh: 'เก็บหนังหมาป่าพงไพร (0/2)',
      },
    ],
    rewards: {
      exp: 220,
      gold: 100,
      echoShards: 2,
      items: [{ defId: 'item_steel_blade', quantity: 1 }],
    },
  },
  quest_defeat_golem: {
    id: 'quest_defeat_golem',
    titleEn: 'Guardian of the Echo Ruins',
    titleTh: 'ผู้พิทักษ์แห่งซากโบราณสถาน',
    descriptionEn: 'Guild Master Elara authorized your expedition. Delve deep into the ruins and topple the Ancient Golem!',
    descriptionTh: 'หัวหน้ากิลด์เอลาราอนุมัติการสำรวจ จงลงสู่ส่วนลึกของดันเจี้ยนและโค่นล้มโกเลมโบราณ!',
    giverNpcId: 'elara',
    minLevel: 3,
    objectives: [
      {
        id: 'obj_golem',
        type: 'defeat_boss',
        targetId: 'golem',
        targetCount: 1,
        currentCount: 0,
        descriptionEn: 'Defeat Ancient Golem (0/1)',
        descriptionTh: 'กำจัดโกเลมศิลาโบราณ (0/1)',
      },
    ],
    rewards: {
      exp: 600,
      gold: 300,
      echoShards: 5,
      items: [{ defId: 'item_crystal_edge', quantity: 1 }],
    },
  },
};

export function getQuestDefinition(id: string): QuestDefinition | undefined {
  return QUEST_REGISTRY[id];
}
