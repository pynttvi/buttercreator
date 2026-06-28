import { describe, expect, test } from "vitest";
import { getEffectiveAbilityMax } from "./abilityMax";

const baseReinc = {
  skillMax: 100,
  spellMax: 100,
  customSkillMaxBonus: 0,
  customSpellMaxBonus: 0,
  race: {
    id: 1,
    name: "test race",
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
    size: 10,
    exp: 100,
    spr: 100,
    hpr: 100,
    skill_max: 100,
    spell_max: 100,
    skill_cost: 100,
    spell_cost: 100,
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
          ...baseReinc.race,
          skill_max: 100,
          spell_max: 90,
        },
      }),
    ).toBe(100);
  });
});
