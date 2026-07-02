import { describe, expect, test } from "vitest";
import { GuildAbility } from "../parsers/guildParser";
import { abilityAdapter, initialState, ReincAbility } from "./appContext";
import reducer, { addOrUpdateGuild, updateAbility } from "./reincReducer";

const guildAbility: GuildAbility = {
  name: "removed guild skill",
  type: "skill",
  max: 100,
  cost: 0,
};

const guild = {
  name: "test guild",
  guildType: "main",
  enabled: true,
  levels: 1,
  trained: 1,
  mainGuildName: "",
  subGuilds: [],
  levelMap: {
    "1": {
      stats: [],
      abilities: [guildAbility],
    },
  },
};

const selectedAbility: ReincAbility = {
  ...guildAbility,
  id: 1,
  cost: 10,
  enabled: true,
  guild: guild as never,
  maxed: false,
  trained: 100,
};

describe("reincReducer guild ability sync", () => {
  test("removes selected abilities that are no longer available from trained guilds", () => {
    const state = {
      ...initialState,
      creatorDataState: {
        ...initialState.creatorDataState,
        creatorData: {
          skills: [{ name: guildAbility.name, cost: 10 }],
          spells: [],
        },
      },
      reincContext: {
        ...initialState.reincContext,
        ready: true,
        level: 1,
        guilds: [guild],
        skills: abilityAdapter.setAll(
          abilityAdapter.getInitialState(),
          [selectedAbility],
        ),
      },
    } as never;

    const nextState = reducer(
      state,
      addOrUpdateGuild({
        guildType: "main",
        guild: guild as never,
        trained: 0,
      }),
    );

    expect(nextState.reincContext.skills.ids).toEqual([]);
  });

  test("stores selected abilities under the trained guild with the highest max", () => {
    const lowGuild = {
      ...guild,
      name: "low guild",
      levelMap: {
        "1": {
          stats: [],
          abilities: [
            {
              ...guildAbility,
              name: "shared guild skill",
              max: 40,
            },
          ],
        },
      },
    };
    const highGuild = {
      ...guild,
      name: "high guild",
      levels: 10,
      trained: 10,
      levelMap: {
        "3": {
          stats: [],
          abilities: [
            {
              ...guildAbility,
              name: "shared guild skill",
              max: 80,
            },
          ],
        },
      },
    };
    const ability = {
      ...selectedAbility,
      name: "shared guild skill",
      guild: lowGuild as never,
      max: 40,
      trained: 80,
    };
    const state = {
      ...initialState,
      creatorDataState: {
        ...initialState.creatorDataState,
        creatorData: {
          skills: [{ name: ability.name, cost: 10 }],
          spells: [],
        },
      },
      reincContext: {
        ...initialState.reincContext,
        ready: true,
        level: 20,
        guilds: [lowGuild, highGuild],
      },
    } as never;

    const nextState = reducer(
      state,
      updateAbility({
        type: "skills",
        ability,
      }),
    );
    const storedAbility =
      nextState.reincContext.skills.entities[selectedAbility.id];

    expect(storedAbility?.max).toBe(80);
    expect(storedAbility?.guild?.name).toBe("high guild");
  });
});
