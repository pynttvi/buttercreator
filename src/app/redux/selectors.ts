import { abilityAdapter } from "./appContext";
import { RootState } from "./reincStore";

/* ---------------------------------- */
/* Base Slice Selectors               */
/* ---------------------------------- */

const selectReinc = (state: RootState) => state.reducer.reincContext;
const selectFilteredData = (state: RootState) => state.reducer.filteredData;

/* ---------------------------------- */
/* Filtered Data Selectors            */
/* ---------------------------------- */

export const selectFilteredSkills = (state: RootState) =>
  selectFilteredData(state).skills;

export const selectFilteredSpells = (state: RootState) =>
  selectFilteredData(state).spells;

/* ---------------------------------- */
/* Entity State Selectors             */
/* ---------------------------------- */

export const selectReincSkillsState = (state: RootState) =>
  selectReinc(state).skills;

export const selectReincSpellsState = (state: RootState) =>
  selectReinc(state).spells;

export const selectAllSkillsState = (state: RootState) =>
  selectReinc(state).allSkills;

export const selectAllSpellsState = (state: RootState) =>
  selectReinc(state).allSpells;

/* ---------------------------------- */
/* Entity Adapter Selectors           */
/* ---------------------------------- */

export const reincSkillsSelectors =
  abilityAdapter.getSelectors<RootState>(selectReincSkillsState);

export const reincSpellsSelectors =
  abilityAdapter.getSelectors<RootState>(selectReincSpellsState);

export const allSkillsSelectors =
  abilityAdapter.getSelectors<RootState>(selectAllSkillsState);

export const allSpellsSelectors =
  abilityAdapter.getSelectors<RootState>(selectAllSpellsState);

/* ---------------------------------- */
/* Primitive Value Selectors          */
/* ---------------------------------- */

export const selectReady = (state: RootState) =>
  selectReinc(state).ready;

export const selectLevel = (state: RootState) =>
  selectReinc(state).level;

export const selectFreeLevels = (state: RootState) =>
  selectReinc(state).freeLevels;

export const selectRace = (state: RootState) =>
  selectReinc(state).race;

export const selectSkillMax = (state: RootState) =>
  selectReinc(state).skillMax;

export const selectSpellMax = (state: RootState) =>
  selectReinc(state).spellMax;

export const selectCustomSkillMaxBonus = (state: RootState) =>
  selectReinc(state).customSkillMaxBonus;

export const selectCustomSpellMaxBonus = (state: RootState) =>
  selectReinc(state).customSpellMaxBonus;

export const selectCopyPasteSeparator = (state: RootState) =>
  selectReinc(state).copyPasteSeparator;

export const selectHelpText = (state: RootState) =>
  selectReinc(state).helpText;

export const selectDrawerOpen = (state: RootState) =>
  selectReinc(state).drawerOpen;

/* ---------------------------------- */
/* Array / Object Selectors           */
/* ---------------------------------- */

export const selectGuilds = (state: RootState) =>
  selectReinc(state).guilds;

export const selectAllGuilds = (state: RootState) =>
  selectReinc(state).allGuilds;

export const selectStats = (state: RootState) =>
  selectReinc(state).stats;

export const selectBonusBaseStats = (state: RootState) =>
  selectReinc(state).bonusBaseStats;

export const selectWishes = (state: RootState) =>
  selectReinc(state).wishes;
