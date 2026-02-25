import { createEntityAdapter, EntityState } from "@reduxjs/toolkit";
import { Wish } from "../data/wishHandler";
import { FilterDataType } from "../filters/creatorDataFilters";
import { CreatorDataType } from "../parserFactory";
import { Ability } from "../parsers/abilityCostParser";
import { GuildAbility } from "../parsers/guildParser";
import {
  BaseStatName,
  BaseStats,
  baseStats,
  Race,
} from "../parsers/raceParser";
import { FullGuild } from "../utils/guildUtils";

export const MAX_STAT = 50;

export const abilityAdapter = createEntityAdapter<ReincAbility, number>({
  selectId: (ability) => ability.id,
  sortComparer: (a, b) => a.name?.localeCompare(b.name),
});

export type ReincContextType = {
  ready: boolean;
  level: number;
  freeLevels: number;
  race: Race | null;
  guilds: FullGuild[];
  allGuilds: FullGuild[];
  skills: EntityState<ReincAbility, number>;
  spells: EntityState<ReincAbility, number>;
  allSkills: EntityState<ReincAbility, number>;
  allSpells: EntityState<ReincAbility, number>;
  skillMax: number;
  spellMax: number;
  customSkillMaxBonus: number;
  customSpellMaxBonus: number;
  stats: ReincStat[];
  bonusBaseStats: BonusBaseStat[];
  wishes: Wish[];
  copyPasteSeparator: string;
  helpText: string;
  drawerOpen: boolean;
};

export type CreatorDataStateType = {
  initialized: boolean;
  creatorData: CreatorDataType;
  originalCreatorData: CreatorDataType;
};

export type AppContext = {
  reincContext: ReincContextType;
  creatorDataState: CreatorDataStateType;
  filteredData: FilterDataType;

};
export type AppReducer = {
  reducer: AppContext;
};

export const initialState: AppContext = {
  reincContext: {
    ready: false,
    level: 0,
    freeLevels: 0,
    race: null,
    guilds: [],
    allGuilds: [],
    skills: abilityAdapter.getInitialState(),
    spells: abilityAdapter.getInitialState(),
    allSkills: abilityAdapter.getInitialState(),
    allSpells: abilityAdapter.getInitialState(),
    skillMax: 100,
    spellMax: 100,
    customSkillMaxBonus: 0,
    customSpellMaxBonus: 0,
    stats: baseStats.map((bs, idx) => ({
      id: idx,
      name: bs,
      trained: 0,
    })),
    bonusBaseStats: baseStats.map((bs) => ({
      name: bs,
      percent: 0,
    })),
    wishes: [],

    copyPasteSeparator: ";",
    helpText: "",
    drawerOpen: false,
  },
  creatorDataState: {
    initialized: false,
    creatorData: {} as CreatorDataType,
    originalCreatorData: {} as CreatorDataType,
  },
  filteredData: {
      skills: [],
      spells: [],
      guilds: [],
    },
};

export type ReincAbility = Ability & GuildAbility;

export type ReincStat = {
  id: number;
  name: keyof BaseStats;
  trained: number;
};

export type BonusBaseStat = { name: BaseStatName; percent: number };
