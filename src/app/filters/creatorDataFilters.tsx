"use client";

import { FullGuild, GuildUtils } from "@/app/utils/guildUtils";
import {
  entityToArray,
  onlyUniqueNameWithHighestMax,
  sortByName,
} from "@/app/utils/utils";
import {
  CreatorDataStateType,
  ReincAbility,
  ReincContextType,
} from "../redux/appContext";

export type FilterDataType = {
  skills: ReincAbility[];
  spells: ReincAbility[];
  guilds: FullGuild[];
};

export type CreatorDataFilterType = {
  doFilter: () => Partial<FilterDataType>;
};

/* ---------------------------------- */
/* DO FILTER                          */
/* ---------------------------------- */

export const doFilter = (
  creatorDataState: CreatorDataStateType,
  reinc: ReincContextType,
): FilterDataType => {
  if (!reinc) {
    return { skills: [], spells: [], guilds: [] };
  }

  const { skills, spells } = AbilitiesByGuildsFilter(
    creatorDataState,
    reinc,
  ).doFilter() as FilterDataType;

  const guildResult =
    reinc.level === 0
      ? GuildsByAbilitiesFilter(creatorDataState, reinc).doFilter()
      : { guilds: reinc.allGuilds };

  return {
    skills: skills ?? [],
    spells: spells ?? [],
    guilds: sortByName(guildResult.guilds ?? []),
  };
};

/* ---------------------------------- */
/* ABILITIES FILTER                   */
/* ---------------------------------- */

export const AbilitiesByGuildsFilter = (
  creatorDataState: CreatorDataStateType,
  reinc: ReincContextType,
): CreatorDataFilterType => {
  const guildUtils = GuildUtils(creatorDataState.creatorData, reinc);

  return {
    doFilter: () => {
      const allSkills = entityToArray(reinc.allSkills);
      const allSpells = entityToArray(reinc.allSpells);

      if (reinc.level === 0) {
        return {
          skills: onlyUniqueNameWithHighestMax(allSkills),
          spells: onlyUniqueNameWithHighestMax(allSpells),
        };
      }

      const flatGuilds = guildUtils.getReincGuildsFlat();
      console.debug("Flat guilds for abilities filter", flatGuilds);
      const mapAbility = (ability: ReincAbility): ReincAbility => {
        const enabled =
          !!flatGuilds.find((g) => g.name === ability.guild?.name);

        return {
          ...ability,
          enabled,
          max: guildUtils.maxForGuilds(ability, flatGuilds),
        };
      };

      const enabledSkills = allSkills.map(mapAbility).filter((a) => a.enabled);
      const enabledSpells = allSpells.map(mapAbility).filter((a) => a.enabled);
      
      return {
        skills: onlyUniqueNameWithHighestMax(enabledSkills),
        spells: onlyUniqueNameWithHighestMax(enabledSpells),
      };
    },
  };
};

/* ---------------------------------- */
/* GUILDS FILTER                      */
/* ---------------------------------- */
export const GuildsByAbilitiesFilter = (
  creatorDataState: CreatorDataStateType,
  reinc: ReincContextType,
): CreatorDataFilterType => {
  return {
    doFilter: () => {
      const allGuilds = reinc.allGuilds as FullGuild[];

      if (reinc.level > 0) {
        return { guilds: allGuilds };
      }

      if (!allGuilds.length) {
        return { guilds: reinc.guilds };
      }

      const guildUtils = GuildUtils(
        creatorDataState.creatorData,
        reinc,
      );

      const flatGuilds = guildUtils.getAllGuildsFlat();
      const trainedAbilities = [
        ...entityToArray(reinc.skills),
        ...entityToArray(reinc.spells),
      ].filter((a) => a.trained > 0);

      const guildsWithTrainedAbilities = new Set<string>();

      flatGuilds.forEach((guild) => {
        Object.values(guild.levelMap).forEach((level) => {
          level.abilities.forEach((ability) => {
            if (trainedAbilities.some((a) => a.name === ability.name)) {
              guildsWithTrainedAbilities.add(guild.name);
            }
          });
        });
      });

      const filtered = allGuilds.filter((guild) => {
        if (guildsWithTrainedAbilities.has(guild.name)) return true;

        return guild.subGuilds.some(
          (sg) =>
            guildsWithTrainedAbilities.has(sg.name) ||
            sg.subGuilds.some((sg2) =>
              guildsWithTrainedAbilities.has(sg2.name),
            ),
        );
      });

      return {
        guilds:
          filtered.length > 0
            ? sortByName(filtered)
            : sortByName(allGuilds),
      };
    },
  };
};
