import { describe, it, expect, beforeEach } from 'vitest';
import { 
  getAllPetSpecies, 
  getPetSpecies, 
  calculatePetStats, 
  calculateRequiredPetExp, 
  createPetInstance 
} from '../src/features/pets/petRegistry';
import { EggDropManager } from '../src/features/pets/eggDropManager';
import { useGameStore } from '../src/app/store/useGameStore';
import { PetSpeciesId } from '../src/shared/types';

describe('Pet Companion & Hatchery System', () => {
  beforeEach(() => {
    // Reset pet store state before each test
    const store = useGameStore.getState();
    store.pets = [];
    store.petEggs = [];
    store.activePetId = null;
  });

  describe('Pet Species Registry', () => {
    const requiredSpecies: PetSpeciesId[] = [
      'forest_slime',
      'ember_fox',
      'frost_bunny',
      'thunder_cub',
      'shadow_cat',
      'crystal_sprite',
      'moss_turtle',
      'baby_dragon',
    ];

    it('contains all 8 required pet species', () => {
      const allSpecies = getAllPetSpecies();
      expect(allSpecies.length).toBe(8);

      requiredSpecies.forEach((id) => {
        const species = getPetSpecies(id);
        expect(species).toBeDefined();
        expect(species.id).toBe(id);
        expect(species.nameEn.length).toBeGreaterThan(0);
        expect(species.nameTh.length).toBeGreaterThan(0);
        expect(species.descriptionEn.length).toBeGreaterThan(0);
        expect(species.descriptionTh.length).toBeGreaterThan(0);
        expect(species.baseStats.hp).toBeGreaterThan(0);
        expect(species.baseStats.atk).toBeGreaterThan(0);
        expect(species.baseStats.def).toBeGreaterThan(0);
        expect(species.growthPerLevel.hp).toBeGreaterThan(0);
      });
    });

    it('defines distinct roles and elements for each species', () => {
      const babyDragon = getPetSpecies('baby_dragon');
      expect(babyDragon.role).toBe('legendary_breaker');
      expect(babyDragon.element).toBe('fire');
      expect(babyDragon.rarity).toBe('legendary');

      const mossTurtle = getPetSpecies('moss_turtle');
      expect(mossTurtle.role).toBe('tank_shield');
      expect(mossTurtle.element).toBe('earth');
      expect(mossTurtle.rarity).toBe('uncommon');

      const forestSlime = getPetSpecies('forest_slime');
      expect(forestSlime.role).toBe('healer');
      expect(forestSlime.element).toBe('wind');
      expect(forestSlime.rarity).toBe('common');
    });
  });

  describe('Stat & EXP Progression Math', () => {
    it('calculates level 1 stats equal to base stats', () => {
      const pet = createPetInstance('ember_fox');
      const species = getPetSpecies('ember_fox');
      const statsLvl1 = calculatePetStats(pet);

      expect(statsLvl1.hp).toBe(species.baseStats.hp);
      expect(statsLvl1.atk).toBe(species.baseStats.atk);
      expect(statsLvl1.def).toBe(species.baseStats.def);
    });

    it('scales stats predictably according to growthPerLevel', () => {
      const pet = createPetInstance('ember_fox');
      pet.level = 5;
      const species = getPetSpecies('ember_fox');
      const statsLvl5 = calculatePetStats(pet);

      const expectedHp = species.baseStats.hp + (5 - 1) * species.growthPerLevel.hp;
      const expectedAtk = species.baseStats.atk + (5 - 1) * species.growthPerLevel.atk;

      expect(statsLvl5.hp).toBe(expectedHp);
      expect(statsLvl5.atk).toBe(expectedAtk);
    });

    it('calculates required EXP with monotonic scaling', () => {
      const exp1 = calculateRequiredPetExp(1);
      const exp2 = calculateRequiredPetExp(2);
      const exp5 = calculateRequiredPetExp(5);
      const exp10 = calculateRequiredPetExp(10);

      expect(exp1).toBe(100);
      expect(exp2).toBeGreaterThan(exp1);
      expect(exp5).toBeGreaterThan(exp2);
      expect(exp10).toBeGreaterThan(exp5);
    });
  });

  describe('Egg Drop and Hatching Pipeline', () => {
    it('guarantees 100% egg drop from Dungeon Bosses', () => {
      const drop = EggDropManager.rollEggDrop(true, true);
      expect(drop).not.toBeNull();
      expect(['legendary', 'epic']).toContain(drop?.rarity);
    });

    it('creates eggs with valid hatching parameters', () => {
      const commonEgg = EggDropManager.createEggInstance('common');
      expect(commonEgg.rarity).toBe('common');
      expect(commonEgg.id).toBeDefined();

      const legendaryEgg = EggDropManager.createEggInstance('legendary', 'baby_dragon');
      expect(legendaryEgg.rarity).toBe('legendary');
      expect(legendaryEgg.speciesId).toBe('baby_dragon');
    });

    it('hatches an egg into a valid pet species matching its rarity pool', () => {
      const egg = EggDropManager.createEggInstance('legendary');
      const speciesId = EggDropManager.hatchEgg(egg);

      expect(speciesId).toBe('baby_dragon'); // Legendary tier only has baby_dragon
      const pet = createPetInstance(speciesId);
      expect(pet).toBeDefined();
      expect(pet.id).toBeDefined();
      expect(pet.speciesId).toBe('baby_dragon');
      expect(pet.level).toBe(1);
      expect(pet.exp).toBe(0);
    });
  });

  describe('GameStore Pet State Management', () => {
    it('adds and summons active pet companion', () => {
      const store = useGameStore.getState();
      const pet = store.addPet('ember_fox', 'Blaze');

      expect(useGameStore.getState().pets.length).toBe(1);
      expect(useGameStore.getState().pets[0].nickname).toBe('Blaze');

      store.setActivePet(pet.id);
      expect(useGameStore.getState().activePetId).toBe(pet.id);

      // Deselect companion
      store.setActivePet(null);
      expect(useGameStore.getState().activePetId).toBeNull();
    });

    it('feeds pet with treats, leveling up and increasing stats', () => {
      const store = useGameStore.getState();
      const pet = store.addPet('frost_bunny', 'Snowball');

      const initialLevel = pet.level;
      const initialStats = calculatePetStats(pet);

      // Feed 450 EXP (level 1 requirement is 100, level 2 is 135, etc.)
      const fed = store.feedPet(pet.id, 450);
      expect(fed).toBe(true);

      const updatedPet = useGameStore.getState().pets.find(p => p.id === pet.id);
      expect(updatedPet).toBeDefined();
      expect(updatedPet!.level).toBeGreaterThan(initialLevel);

      const updatedStats = calculatePetStats(updatedPet!);
      expect(updatedStats.hp).toBeGreaterThan(initialStats.hp);
    });

    it('renames pet successfully', () => {
      const store = useGameStore.getState();
      const pet = store.addPet('thunder_cub', 'Sparky');

      store.renamePet(pet.id, 'Storm');
      const updatedPet = useGameStore.getState().pets.find(p => p.id === pet.id);
      expect(updatedPet?.nickname).toBe('Storm');
    });

    it('adds egg and hatches it via store', () => {
      const store = useGameStore.getState();
      store.addEgg('rare', 'thunder_cub');

      expect(useGameStore.getState().petEggs.length).toBe(1);
      const eggId = useGameStore.getState().petEggs[0].id;

      const hatchedPet = store.hatchEggAtSlot(eggId);
      expect(hatchedPet).not.toBeNull();
      expect(hatchedPet?.speciesId).toBe('thunder_cub');
      expect(useGameStore.getState().petEggs.length).toBe(0);
      expect(useGameStore.getState().pets.some(p => p.id === hatchedPet?.id)).toBe(true);
    });
  });
});
