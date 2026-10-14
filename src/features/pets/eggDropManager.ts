import { PetEggInstance, PetRarity, PetSpeciesId } from '../../shared/types';

export const EGG_SPECIES_POOL: Record<PetRarity, PetSpeciesId[]> = {
  common: ['forest_slime', 'frost_bunny'],
  uncommon: ['ember_fox', 'moss_turtle'],
  rare: ['thunder_cub', 'shadow_cat'],
  epic: ['crystal_sprite'],
  legendary: ['baby_dragon'],
};

export const EGG_RARITY_METADATA: Record<PetRarity, {
  nameEn: string;
  nameTh: string;
  color: string;
  glowColor: string;
  hatchTimeSeconds: number;
  descriptionEn: string;
  descriptionTh: string;
}> = {
  common: {
    nameEn: 'Verdant Egg',
    nameTh: 'ไข่พงไพรสามัญ',
    color: '#4ade80',
    glowColor: 'rgba(74, 222, 128, 0.4)',
    hatchTimeSeconds: 5,
    descriptionEn: 'A warm, mottled egg found resting near tranquil forest groves.',
    descriptionTh: 'ไข่ลายจุดสีเขียวอ่อนที่อบอุ่น พบได้ตามพงหญ้าในป่าสงบ',
  },
  uncommon: {
    nameEn: 'Blazing Earth Egg',
    nameTh: 'ไข่ศิลาเพลิง',
    color: '#f97316',
    glowColor: 'rgba(249, 115, 22, 0.4)',
    hatchTimeSeconds: 10,
    descriptionEn: 'A sturdy shell radiating gentle volcanic heat and earthy moss.',
    descriptionTh: 'เปลือกไข่แข็งแกร่งที่แผ่ไอร้อนและมีร่องรอยของมอสโบราณ',
  },
  rare: {
    nameEn: 'Stormshadow Egg',
    nameTh: 'ไข่อัสนีรัตติกาล',
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.5)',
    hatchTimeSeconds: 15,
    descriptionEn: 'A crackling obsidian egg enveloped in faint violet lightning spirals.',
    descriptionTh: 'ไข่หินออบซิเดียนสีเข้มที่มีประกายสายฟ้าสีม่วงหมุนวนอยู่รอบๆ',
  },
  epic: {
    nameEn: 'Crystalline Prism Egg',
    nameTh: 'ไข่ผลึกมนตราพิสุทธิ์',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.6)',
    hatchTimeSeconds: 20,
    descriptionEn: 'A translucent, faceted egg humming in harmony with ancient ley lines.',
    descriptionTh: 'ไข่ผลึกแก้วใสที่ส่องประกายระยิบระยับและส่งเสียงฮัมประสานกับกระแสพลัง',
  },
  legendary: {
    nameEn: 'Celestial Dragon Egg',
    nameTh: 'ไข่มังกรสวรรค์บรรพกาล',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.7)',
    hatchTimeSeconds: 30,
    descriptionEn: 'A mythical gold-crested dragon egg pulsing with primordial draconic embers.',
    descriptionTh: 'ไข่มังกรในตำนานที่มีลวดลายเกล็ดทองคำ เต้นเป็นจังหวะด้วยประกายเพลิงโบราณ',
  },
};

export class EggDropManager {
  public static createEggInstance(rarity: PetRarity, speciesId?: PetSpeciesId): PetEggInstance {
    return {
      id: `egg_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      rarity,
      speciesId,
      acquiredAt: Date.now(),
    };
  }

  public static rollEggDrop(isDungeon: boolean, isBoss: boolean = false): PetEggInstance | null {
    const roll = Math.random();

    if (isBoss) {
      // Guaranteed drop on boss defeat
      if (roll < 0.40) {
        return this.createEggInstance('legendary');
      } else {
        return this.createEggInstance('epic');
      }
    }

    if (isDungeon) {
      // Dungeon normal enemy drop: ~18% chance
      if (roll < 0.02) return this.createEggInstance('rare');
      if (roll < 0.08) return this.createEggInstance('uncommon');
      if (roll < 0.18) return this.createEggInstance('common');
      return null;
    }

    // Overworld forest enemies: ~12% chance
    if (roll < 0.01) return this.createEggInstance('rare');
    if (roll < 0.04) return this.createEggInstance('uncommon');
    if (roll < 0.12) return this.createEggInstance('common');

    return null;
  }

  public static hatchEgg(egg: PetEggInstance): PetSpeciesId {
    // If egg already had designated species
    if (egg.speciesId) return egg.speciesId;

    const pool = EGG_SPECIES_POOL[egg.rarity] || EGG_SPECIES_POOL.common;
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  }
}
