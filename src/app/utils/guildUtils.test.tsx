import { describe, expect, test } from "vitest";
import { initialState, ReincAbility } from "../redux/appContext";
import { GuildUtils, FullGuild } from "./guildUtils";

const createGuild = (
  name: string,
  levels: number,
  trained: number,
  abilityMax: number,
  subGuilds: FullGuild[] = [],
): FullGuild =>
  ({
    name,
    levels,
    trained,
    guildType: "main",
    enabled: true,
    mainGuildName: "",
    subGuilds,
    levelMap: {
      [levels.toString()]: {
        stats: [],
        abilities: [
          {
            name: "mastery of shielding",
            type: "skill",
            max: abilityMax,
            cost: 0,
          },
        ],
      },
    },
  }) as FullGuild;

describe("GuildUtils.maxForGuilds", () => {
  test("finds the highest ability max from subguilds", () => {
    const subGuild = createGuild("masters of the elements", 7, 0, 100);
    const abjurer = createGuild("abjurer", 45, 45, 25, [subGuild]);

    const ability = {
      name: "mastery of shielding",
    } as ReincAbility;

    expect(
      GuildUtils({} as never, {
        ...initialState.reincContext,
      }).maxForGuilds(ability, [abjurer]),
    ).toBe(100);
  });
});
