import { describe, it, expect } from 'vitest';
import { ALL_SKILLS_36, getSkillsForTree, getSkill } from '../src/features/skills/skillData';
import { Specialization } from '../src/shared/types';

describe('36 Skills Expansion & Specialization System', () => {
  it('registers exactly 36 unique skills', () => {
    const keys = Object.keys(ALL_SKILLS_36);
    expect(keys.length).toBe(36);
  });

  const specializations: Specialization[] = [
    'blade_dancer',
    'guardian',
    'fire_mage',
    'frost_mage',
    'shadow_assassin',
    'echo_mage',
  ];

  it('provides exactly 6 skills for each of the 6 specializations', () => {
    specializations.forEach((spec) => {
      const skillsInTree = getSkillsForTree(spec);
      expect(skillsInTree.length).toBe(6);
    });
  });

  it('ensures each specialization has exactly 1 Ultimate skill', () => {
    specializations.forEach((spec) => {
      const skillsInTree = getSkillsForTree(spec);
      const ultimates = skillsInTree.filter((s) => s.isUltimate);
      expect(ultimates.length).toBe(1);
      expect(ultimates[0].tier).toBe(4);
      expect(ultimates[0].damageMultiplier).toBeGreaterThanOrEqual(4.5);
    });
  });

  it('validates bilingual localization (EN and TH) on all skills', () => {
    Object.values(ALL_SKILLS_36).forEach((skill) => {
      expect(skill.nameEn.trim().length).toBeGreaterThan(0);
      expect(skill.nameTh.trim().length).toBeGreaterThan(0);
      expect(skill.descriptionEn.trim().length).toBeGreaterThan(0);
      expect(skill.descriptionTh.trim().length).toBeGreaterThan(0);
    });
  });

  it('verifies all skill prerequisites point to valid skills within the system', () => {
    Object.values(ALL_SKILLS_36).forEach((skill) => {
      if (skill.prerequisites && skill.prerequisites.length > 0) {
        skill.prerequisites.forEach((prereqId) => {
          const prereqSkill = getSkill(prereqId);
          expect(prereqSkill).toBeDefined();
          expect(prereqSkill?.tree).toBe(skill.tree);
        });
      }
    });
  });

  it('ensures all skills have valid combat parameters and cooldowns', () => {
    Object.values(ALL_SKILLS_36).forEach((skill) => {
      if (skill.isActive) {
        expect(skill.cooldownMs).toBeGreaterThan(0);
      } else {
        expect(skill.cooldownMs).toBeGreaterThanOrEqual(0);
      }
      if (skill.damageMultiplier !== undefined) {
        expect(skill.damageMultiplier).toBeGreaterThan(0);
      }
      expect(skill.maxRank).toBeGreaterThanOrEqual(1);
      expect(['physical', 'fire', 'ice', 'shadow', 'crystal', 'earth', 'wind']).toContain(skill.element);
    });
  });
});
