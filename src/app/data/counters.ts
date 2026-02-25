import {
  Lesser,
  minorWishCosts,
  RESIST_WISH_NAME_SUFFIX,
  STAT_WISH_NAME_PREFIX,
  WishType,
} from "@/app/data/wishHandler";
import {
  baseStats,
  resistanceNames,
  ResistanceTypeName,
} from "@/app/parsers/raceParser";
import { entityToArray, simplifyStat, sortByName } from "@/app/utils/utils";
import { useEffect } from "react";
import { GuildStat } from "../parsers/guildParser";
import { useAppSelector, useCreatorData, useGuildUtils } from "../redux/hooks";
import { reincSkillsSelectors, reincSpellsSelectors } from "../redux/selectors";

export type ReincResist = { name: ResistanceTypeName; value: number };

export const useCounters = () => {
  const guildUtils = useGuildUtils();
  const data = useCreatorData();
  const wishes = useAppSelector((state) => state.reducer.reincContext.wishes);
  const level = useAppSelector((state) => state.reducer.reincContext.level);
  const freeLevels = useAppSelector(
    (state) => state.reducer.reincContext.freeLevels,
  );
  const skills = useAppSelector(reincSkillsSelectors.selectAll);
  const spells = useAppSelector(reincSpellsSelectors.selectAll);
  const race = useAppSelector((state) => state.reducer.reincContext.race);
  const stats = useAppSelector((state) => state.reducer.reincContext.stats);

  useEffect(() => {
    console.debug("Counters updated", wishes);
  }, [wishes]);

  const countTaskPoints = (): number => {
    let tpCount = 0;

    if (data.wishCost) {
      console.debug("Wishcosts", data.wishCost);
      const greaterCount = wishes.filter(
        (w) => w.type === WishType.GREATER,
      ).length;
      tpCount =
        tpCount +
        (greaterCount > 0
          ? data.wishCost
              .slice(Lesser.length, Lesser.length + greaterCount)
              .reduce((tp1, tp2) => tp1 + tp2, 0)
          : 0);

      const lesserCount = wishes.filter(
        (w) => w.type === WishType.LESSER,
      ).length;
      tpCount =
        tpCount +
        (lesserCount > 0
          ? data.wishCost
              .slice(0, lesserCount)
              .reduce((tp1, tp2) => tp1 + tp2, 0)
          : 0);

      wishes
        .filter((w) => w.type === WishType.MINOR)
        .forEach((w) => {
          if (w.name.includes(STAT_WISH_NAME_PREFIX)) {
            tpCount =
              tpCount +
              (minorWishCosts.find((wn) =>
                wn.name.includes(STAT_WISH_NAME_PREFIX),
              )?.cost || 0);
          } else if (w.name.includes(RESIST_WISH_NAME_SUFFIX)) {
            tpCount =
              tpCount +
              (minorWishCosts.find((wn) =>
                wn.name.includes(RESIST_WISH_NAME_SUFFIX),
              )?.cost || 0);
          } else {
            tpCount =
              tpCount +
              (minorWishCosts.find((wn) => wn.name.includes(w.name))?.cost ||
                0);
          }
        });
    }

    return tpCount;
  };

  const countQpCost = (): number => {
    let qpCost = 0;
    console.debug("QP costs", data.qpCost);

    if (data.qpCost && level && level > 0) {
      qpCost = data.qpCost
        .slice(0, level)
        .reduce((qpl1, qpl2) => qpl1 + qpl2, 0);
    }
    console.debug("QP cost", qpCost);

    return qpCost;
  };

  const countLevelCost = (lv: number): number => {
    let levelCost = 0;

    if (data.levelCosts && lv > 0) {
      console.debug("Level costs", lv, data.levelCosts);
      levelCost = data.levelCosts
        .slice(0, lv)
        .reduce((l1, l2) => l1 + l2, 0);
    }
    console.debug("Level cost", levelCost);

    return levelCost;
  };

  const countLevelCostWithQps = (): number => {
    return countLevelCost(level) * 0.75;
  };

  const countGuildLevelCost = (): number => {
    return countLevelCost(level - freeLevels) * 0.4;
  };

  const costFactors = [
    0, 1, 2, 4, 8, 13, 22, 38, 64, 109, 184, 310, 523, 882, 1487, 2506, 4222,
    7115, 11989, 20202, 34040, 999999, 999999, 999999,
  ];

  const countAbilitiesCost = (
    type: "skill" | "spell",
    name?: string,
  ): { exp: number; gold: number } => {
    let abilityCost = 0;

    const target = type === "skill" ? skills : spells;

    target
      .filter((a) => a && a.trained > 0 && (!name || name === a.name))
      .forEach((a) => {
        const trainCount = Math.floor(a.trained / 5) || 0;

        let tempCost = 0;

        for (let i = 0; i <= trainCount; i++) {
          tempCost += Math.min(
            costFactors[Math.min(i, costFactors.length - 1)] * a.cost,
            10000000,
          );
        }

        tempCost =
          (tempCost *
            (type === "skill"
              ? (race?.skill_cost ?? 100)
              : (race?.spell_cost ?? 100))) /
          100;

        abilityCost += tempCost;
      });

    return {
      exp: abilityCost,
      gold: (abilityCost * 0.044444) / 100,
    };
  };

  const countStats = (): number => {
    let statCosts = 0;
    console.debug("Stat costs", data.statCost);

    baseStats.forEach((bs) => {
      if (data.statCost && stats) {
        const reincStat = stats.find((rs) => rs.name === bs);
        if (reincStat && reincStat.trained > 0) {
          statCosts =
            statCosts +
            data.statCost
              .slice(0, reincStat.trained + 1)
              .reduce((l1, l2) => l1 + l2, 0);
        }
      }
    });
    console.debug("Stat costs", statCosts);

    return statCosts;
  };

  const getHpmax = () => {
    let hpmax = -1;
    if (!race) {
      return -1;
    }
    // TODO : Move to wishes
    if (
      wishes.find((w) => w.name === "lesser physical improvement" && w.applied)
    ) {
      hpmax += 0.75 * race?.con + 0.5 * race?.size + 25;
    }
    // TODO : Move to wishes
    if (
      wishes.find((w) => w.name === "greater physical improvement" && w.applied)
    ) {
      hpmax += 1.5 * race?.con + race?.size + 50;
    }

    const con = guildUtils.getStatTotalFromGuilds("constitution") || 0;
    const hitPoints = guildUtils.getStatTotalFromGuilds("hit points") || 0;
    hpmax += hitPoints;
    hpmax += Math.round(2 * race.size + con * 3);
    return Math.round(hpmax);
  };

  const getSpmax = () => {
    let spmax = -1;
    if (!race) {
      return -1;
    }
    // TODO : Move to wishes
    if (
      wishes.find((w) => w.name === "lesser magical improvement" && w.applied)
    ) {
      spmax += 0.75 * race?.int + 0.5 * race?.wis + 50;
    }
    // TODO : Move to wishes
    if (
      wishes.find((w) => w.name === "greater magical improvement" && w.applied)
    ) {
      spmax += 1.5 * race?.int + race?.wis + 100;
    }

    const int = guildUtils.getStatTotalFromGuilds("intelligence") || 0;
    const wis = guildUtils.getStatTotalFromGuilds("wisdom") || 0;
    const spellPoints = guildUtils.getStatTotalFromGuilds("spell points") || 0;
    spmax += spellPoints;
    spmax += 3 * wis + 4 * int;
    return Math.round(spmax);
  };

  const getReincStat = (stat: string) => {
    if (!race) {
      return -1;
    }
    const raceFactor =
      (Object.entries(race)
        .find((entry) => {
          return entry[0] === simplifyStat(stat);
        })
        ?.at(1) as number) || 100;

    const reincStat = 100 + (guildUtils.getStatTotalFromGuilds(stat) || 0);

    return Math.round((raceFactor * reincStat) / 100);
  };

  const getGuildResists = (): ReincResist[] => {
    const resistances: ReincResist[] = [];
    const flatGuilds = guildUtils.getReincGuildsFlat();
    console.debug("FALTL", flatGuilds);
    const guildLevels = flatGuilds.map((g) =>
      Object.values(g.levelMap).slice(0, g.trained),
    );
    console.debug("Trained GUILD LEVELS", guildLevels);
    const allGuildLevelsList = guildLevels.map((e1) => e1);
    console.debug("ALL GUILD LEVELS LIST", allGuildLevelsList);
    const allGuildLevels = allGuildLevelsList.reduce(
      (gs1, gs2) => gs1.concat(gs2),
      [],
    );
    const stats = allGuildLevels.map((gl) => gl.stats);
    const allStats: GuildStat[] = stats.reduce((s1, s2) => s1.concat(s2), []);

    resistanceNames.forEach((rn) => {
      const res = guildUtils.getStatTotalFromGuilds(rn);
      const totalAmount = allStats
        .filter((s: GuildStat) => simplifyStat(s.name) === simplifyStat(rn))
        .map((s: GuildStat) => s.value)
        .reduce((s1: any, s2: any) => s1 + s2, 0);

      console.debug("resistance", rn, res);

      if (totalAmount > 0) {
        resistances.push({
          name: rn as ResistanceTypeName,
          value: totalAmount,
        });
      }
    });
    return sortByName<ReincResist>(resistances);
  };

  return {
    countTaskPoints,
    countQpCost,
    countLevelCost,
    countLevelCostWithQps,
    countGuildLevelCost,
    countAbilitiesCost,
    countStats,
    getHpmax,
    getSpmax,
    getReincStat,
    getGuildResists,
  };
};
