import type { ReincContextType } from "../redux/appContext";

export const getEffectiveAbilityMax = (
  type: "skills" | "spells",
  abilityMax: number,
  reinc: Pick<
    ReincContextType,
    | "skillMax"
    | "spellMax"
    | "customSkillMaxBonus"
    | "customSpellMaxBonus"
    | "race"
  >,
) => {
  if (type === "skills") {
    if (reinc.skillMax - abilityMax >= 0) {
      return (
        reinc.customSkillMaxBonus +
        Math.min(abilityMax - (100 - reinc.skillMax), reinc.skillMax)
      );
    }

    return (
      reinc.customSkillMaxBonus +
      Math.min(abilityMax, reinc.race?.skill_max || 100)
    );
  }

  if (reinc.spellMax - abilityMax >= 0) {
    return (
      reinc.customSpellMaxBonus +
      Math.min(abilityMax - (100 - reinc.spellMax), reinc.spellMax)
    );
  }

  return (
    reinc.customSpellMaxBonus +
    Math.min(abilityMax, reinc.race?.spell_max || 100)
  );
};
