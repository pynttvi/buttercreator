import { ReincAbility } from "../redux/appContext";

export type AbilityContextType = {
  updateAbility: (
    type: "skills" | "spells",
    ability: ReincAbility | ReincAbility[],
  ) => ReincAbility | ReincAbility[];
};
