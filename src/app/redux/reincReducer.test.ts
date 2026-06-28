import { describe, expect, test } from "vitest";
import { GuildAbility } from "../parsers/guildParser";
import { abilityAdapter, initialState, ReincAbility } from "./appContext";
import reducer, { addOrUpdateGuild } from "./reincReducer";

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
});
