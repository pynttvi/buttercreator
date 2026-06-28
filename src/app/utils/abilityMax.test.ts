import { describe, expect, test } from "vitest";
import { getEffectiveAbilityMax } from "./abilityMax";

const baseReinc = {
  skillMax: 100,
  spellMax: 100,
  customSkillMaxBonus: 0,
  customSpellMaxBonus: 0,
  race: {
    skill_max: 100,
    spell_max: 100,
  },
};

describe("getEffectiveAbilityMax", () => {
  test("allows skills above raw max when knowledge wishes increase max", () => {
    expect(
      getEffectiveAbilityMax("skills", 100, {
        ...baseReinc,
        skillMax: 110,
      }),
    ).toBe(110);
  });

  test("adds wish bonus to lower race max", () => {
    expect(
      getEffectiveAbilityMax("spells", 100, {
        ...baseReinc,
        spellMax: 100,
        race: {
          skill_max: 100,
          spell_max: 90,
        },
      }),
    ).toBe(100);
  });
});
