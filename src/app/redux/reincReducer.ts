// reincReducer.ts

import { createSlice, PayloadAction, ThunkAction } from "@reduxjs/toolkit";
import { UnknownAction } from "redux";
import { GuildType } from "../components/guilds";
import { doFilter } from "../filters/creatorDataFilters";
import { CreatorDataType } from "../parserFactory";
import { GuildAbility } from "../parsers/guildParser";
import { FullGuild, GuildUtils } from "../utils/guildUtils";
import {
  abilityAdapter,
  AppContext,
  initialState,
  ReincAbility,
} from "./appContext";
import { RootState } from "./reincStore";
import { entityToArray } from "../utils/utils";
import { selectBonusBaseStats } from "./selectors";
export const MAX_LEVEL = 120;

const appSlice = createSlice({
  name: "buttercreator",
  initialState,
  reducers: {
    // --- CreatorData reducers ---
    setCreatorData: (
      state,
      action: PayloadAction<{ value: CreatorDataType }>,
    ) => {
      state.creatorDataState.creatorData = action.payload.value;
      state.creatorDataState.originalCreatorData = {
        ...action.payload.value,
      };
    },

    setInitialized: (state, action: PayloadAction<{ value: boolean }>) => {
      state.creatorDataState.initialized = action.payload.value;
    },

    // --- Reinc reducers ---
    updateReinc: (
      state,
      action: PayloadAction<Partial<AppContext["reincContext"]>>,
    ) => {
      Object.assign(state.reincContext, action.payload);
    },
    setReady: (state, action: PayloadAction<{ value: boolean }>) => {
      state.reincContext.ready = action.payload.value;
    },
    setRace: (state, action) => {
      state.reincContext.race = action.payload;
      state.reincContext.skillMax = action.payload?.skill_max ?? 100;
      state.reincContext.spellMax = action.payload?.spell_max ?? 100;
    },

    setSkills: (state, action) => {
      abilityAdapter.setAll(state.reincContext.skills, action.payload);
    },

    setAllSkills: (state, action) => {
      abilityAdapter.setAll(state.reincContext.allSkills, action.payload);
    },

    setSpells: (state, action) => {
      abilityAdapter.setAll(state.reincContext.spells, action.payload);
    },

    setAllSpells: (state, action) => {
      abilityAdapter.setAll(state.reincContext.allSpells, action.payload);
    },

    updateStat: (state, action) => {
      const { id, trained } = action.payload;
      const newStats = [
        ...state.reincContext.stats.map((s) => {
          if (s.id === id) {
            s.trained = trained;
          }
          return s;
        }),
      ];

      state.reincContext.stats = newStats;
    },

    setGuilds: (state, action) => {
      state.reincContext.guilds = action.payload;
    },

    setAllGuilds: (state, action) => {
      state.reincContext.allGuilds = action.payload;
    },

    setWishes: (state, action) => {
      state.reincContext.wishes = [...action.payload];
    },

    setBonusBaseStats: (state, action) => {
      state.reincContext.bonusBaseStats = action.payload;
    },

    setLevel: (state, action) => {
      state.reincContext.level = action.payload;
    },

    setFreeLevels: (state, action) => {
      state.reincContext.freeLevels = action.payload;
    },

    setFilteredData: (state, action) => {
      state.filteredData = action.payload;
    },

    setDrawerOpen: (state, action) => {
      state.reincContext.drawerOpen = action.payload;
    },
    setHelpText: (state, action) => {
      state.reincContext.helpText = action.payload;
    },

    setSkillMax: (state, action) => {
      state.reincContext.skillMax = action.payload;
    },

    setSpellMax: (state, action) => {
      state.reincContext.spellMax = action.payload;
    },

    setCustomSkillMaxBonus: (state, action) => {
      state.reincContext.customSkillMaxBonus = action.payload;
    },
    setCustomSpellMaxBonus: (state, action) => {
      state.reincContext.customSpellMaxBonus = action.payload;
    },
    setCopyPasteSeparator: (state, action) => {
      state.reincContext.copyPasteSeparator = action.payload;
    },
    addOrUpdateGuild: (
      state,
      action: PayloadAction<{
        guildType: GuildType;
        guild: FullGuild;
        trained: number;
      }>,
    ) => {
      const { guildType, guild, trained } = action.payload;
      const guilds = state.reincContext.guilds;

      if (guildType === "main") {
        const idx = guilds.findIndex(
          (g) => g.name.toLowerCase() === guild.name.toLowerCase(),
        );

        if (idx === -1) {
          guilds.push({
            ...guild,
            guildType: "main",
            trained,
            name: guild.name.toLowerCase().replaceAll("_", " "),
          });
        } else {
          guilds[idx].trained = trained;

          if (trained === 0) {
            guilds[idx].subGuilds.forEach((sg) => {
              sg.trained = 0;
            });
          }
        }
      } else {
        const main = guilds.find(
          (g) => g.name.toLowerCase() === guild.mainGuildName?.toLowerCase(),
        );

        if (!main) return;

        const sub = main.subGuilds.find((sg) => sg.name === guild.name);

        if (sub) {
          sub.trained = trained;
        }
      }

      state.reincContext.level =
        GuildUtils(
          state.creatorDataState.creatorData,
          state.reincContext,
        ).totalTrainedLevels() + state.reincContext.freeLevels;
    },

    initializeGuilds: (state, action: PayloadAction<FullGuild[]>) => {
      state.reincContext.guilds = action.payload.map((g) => ({
        ...g,
        enabled: true,
      }));
    },

    updateAbility: (state, action) => {
      const { type, ability } = action.payload as {
        type: "skills" | "spells";
        ability: ReincAbility | ReincAbility[];
      };

      const targetState =
        type === "skills"
          ? state.reincContext.skills
          : state.reincContext.spells;

      const abilities = Array.isArray(ability) ? ability : [ability];

      const updates = abilities.map((a) => {
        const costArray =
          type === "skills"
            ? state.creatorDataState.creatorData.skills
            : state.creatorDataState.creatorData.spells;
        const cost = costArray.find((s) => s.name === a.name)?.cost;
        const existing = targetState.entities[a.name];
        const max = existing?.max ?? a.max;
        const trained = Math.min(a.trained, max);

        return {
          ...a,
          trained,
          maxed: trained >= max,
          cost: cost ?? a.cost,
        };
      });
      // console.debug("Updating many", updates);

      abilityAdapter.upsertMany(targetState, updates);
    },

    //     updateAbility: (state, action) => {
    //   const { type, ability } = action.payload as {
    //     type: "skills" | "spells";
    //     ability: ReincAbility | ReincAbility[];
    //   };

    //   const targetState =
    //     type === "skills"
    //       ? state.reincContext.skills
    //       : state.reincContext.spells;

    //   const abilities = Array.isArray(ability) ? ability : [ability];

    //   const updates = abilities.map((a) => {
    //     const existing = targetState.entities[a.name];
    //     const max = existing?.max ?? a.max;
    //     const trained = Math.min(a.trained, max);

    //     return {
    //       ...a,
    //       trained,
    //       maxed: trained >= max,
    //     };
    //   });
    //   // console.debug("Updating many", updates);
    //   abilityAdapter.setMany(targetState, updates);
    // },

    removeAbility: (state, action) => {
      const { type, ability } = action.payload as {
        type: "skills" | "spells";
        ability: ReincAbility | ReincAbility[];
      };

      const targetState =
        type === "skills"
          ? state.reincContext.skills
          : state.reincContext.spells;

      const abilities = Array.isArray(ability) ? ability : [ability];

      const ids = abilities.map((a) => a.name);

      abilityAdapter.removeMany(targetState, ids);
    },
  },
});

export const {
  setCreatorData,
  setInitialized,
  setReady,
  updateReinc,
  setRace,
  setSkills,
  setSpells,
  setAllSkills,
  setAllSpells,
  setGuilds,
  setAllGuilds,
  setWishes,
  setBonusBaseStats,
  setLevel,
  updateStat,
  setFreeLevels,
  setFilteredData,
  setDrawerOpen,
  setHelpText,
  setSkillMax,
  setSpellMax,
  setCustomSkillMaxBonus,
  setCustomSpellMaxBonus,
  setCopyPasteSeparator,
  addOrUpdateGuild,
  initializeGuilds,
  updateAbility,
  removeAbility,
} = appSlice.actions;

export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  UnknownAction
>;

export const recomputeReinc = (): AppThunk => (dispatch, getState) => {
  const state = getState();

  const reinc = state.reducer.reincContext;
  const creator = state.reducer.creatorDataState;

  const fd = doFilter(creator, reinc);
  if (fd) {
    dispatch(setFilteredData(fd));
    // console.debug("Recomputed", fd);
  }
};

export const initAbilities = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const reinc = state.reducer.reincContext;

  const { allGuilds, level, allSkills, allSpells } = reinc;

  if (!allGuilds.length) return;
  if (allSkills.ids.length || allSpells.ids.length) return;

  let id = 0;
  const guildAbilities: ReincAbility[] = [];

  function addAbilities(guild: FullGuild) {
    if (level > 0 && guild.trained === 0) return;

    for (let i = guild.levels + 2; i > 0; i--) {
      const levelData = guild.levelMap[i.toString()];
      levelData?.abilities.forEach((ga: GuildAbility) => {
        guildAbilities.push({
          ...ga,
          cost: 0,
          enabled: true,
          id: id++,
          maxed: false,
          trained: 0,
          guild,
        });
      });
    }
  }

  allGuilds.forEach((guild) => {
    guild.subGuilds.forEach(addAbilities);
    guild.subGuilds.forEach((sg) => sg.subGuilds.forEach(addAbilities));
    addAbilities(guild);
  });

  const skills = guildAbilities.filter((a) => a.type === "skill");
  const spells = guildAbilities.filter((a) => a.type === "spell");

  dispatch(setAllSkills(skills));
  dispatch(setSkills([]));
  dispatch(setAllSpells(spells));
  dispatch(setSpells([]));
};

export default appSlice.reducer;
