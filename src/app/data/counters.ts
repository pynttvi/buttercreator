import {ReincContextType} from "@/app/contexts/reincContext";
import {Lesser, minorWishCosts, RESIST_WISH_NAME_SUFFIX, STAT_WISH_NAME_PREFIX, WishType} from "@/app/data/wishHandler";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {Ability} from "@/app/parsers/abilityCostParser";
import {baseStats, resistanceNames, ResistanceTypeName} from "@/app/parsers/raceParser";
import {onlyUniqueNameWithHighestMax, simplifyStat, sortByName} from "@/app/utils/utils";

export type ReincResist = { name: ResistanceTypeName, value: number }

export default function Counters(reinc: ReincContextType, creatorDataContext: CreatorDataContextType) {

    const data = creatorDataContext.creatorData

    const costFactors = [0, 1, 2, 4, 8, 13, 22, 38, 64, 109, 184, 310, 523, 882, 1487, 2506,
        4222, 7115, 11989, 20202, 34040, 999999, 999999, 999999]

    const countTaskPoints = (): number => {
        let tpCount = 0

        if (data.wishCost) {
            const greaterCount = reinc.wishes.filter((w) => w.type === WishType.GREATER).length
            console.debug("Wishcosts", data.wishCost, greaterCount)
            tpCount = tpCount + (greaterCount > 0 ? data.wishCost.slice(Lesser.length, Lesser.length + greaterCount)
                .reduce((tp1, tp2,) => tp1 + tp2, 0) : 0)

            const lesserCount = reinc.wishes.filter((w) => w.type === WishType.LESSER).length
            tpCount = tpCount + (lesserCount > 0 ? data.wishCost.slice(0, lesserCount + 1).reduce((tp1, tp2,) => tp1 + tp2, 0) : 0)

            reinc.wishes.filter((w) => w.type === WishType.MINOR).forEach((w) => {
                if (w.name.includes(STAT_WISH_NAME_PREFIX)) {
                    tpCount = tpCount + (minorWishCosts.find((wn) => wn.name.includes(STAT_WISH_NAME_PREFIX))?.cost || 0)
                } else if (w.name.includes(RESIST_WISH_NAME_SUFFIX)) {
                    tpCount = tpCount + (minorWishCosts.find((wn) => wn.name.includes(RESIST_WISH_NAME_SUFFIX))?.cost || 0)
                } else {
                    tpCount = tpCount + (minorWishCosts.find((wn) => wn.name.includes(w.name))?.cost || 0)

                }
            })

        }

        return tpCount
    }

    const countQpCost = (): number => {
        let qpCost = 0
        console.debug("QP costs", data.qpCost)

        if (data.qpCost && reinc.level && reinc.level > 0) {
            qpCost = data.qpCost.slice(0, reinc.level).reduce((qpl1, qpl2) => qpl1 + qpl2, 0)
        }
        console.debug("QP cost", qpCost)

        return qpCost
    }

    const countLevelCost = (level?: number): number => {
        let levelCost = 0

        if (data.levelCosts && reinc.level && reinc.level > 0) {
            console.debug("Level costs", data.levelCosts)
            levelCost = data.levelCosts.slice(0, level || reinc.level).reduce((l1, l2) => l1 + l2, 0)
        }
        console.debug("Level cost", levelCost)

        return levelCost
    }

    const countLevelCostWithQps = (level?: number): number => {
        return (countLevelCost(level) * 0.75)
    }


    const countGuildLevelCost = (): number => {
        return (countLevelCost(reinc.level - reinc.freeLevels) * 0.4)
    }

    const countAbilitiesCost = (type: 'skill' | 'spell', name?: string): { exp: number, gold: number } => {
        let abilityCost = 0
        const target = type === 'skill' ? reinc.skills : reinc.spells
        onlyUniqueNameWithHighestMax(target.filter(a => a.enabled)
            .filter((a) => a.trained > 0 && (!name || name === a.name)))
            .forEach((a: Ability) => {
                const trainCount = Math.min(a.trained / 5) || 0
                let tempCost = 0
                for (let i = 0; i < trainCount + 1; i++) {
                    tempCost = tempCost + Math.min(costFactors[Math.min(i, costFactors.length - 1)] * a.cost, 10000000)
                }
                tempCost = ((tempCost * (type === 'skill' ? reinc?.race?.skill_cost || 100 : reinc?.race?.spell_cost || 100)) / 100)

                console.debug("Ability cost", tempCost, a)
                abilityCost = abilityCost + tempCost
            })
        console.debug("Ability total cost", abilityCost)

        return {exp: abilityCost, gold: (abilityCost * 0.044444) / 100}

    }

    const countStats = (): number => {
        let statCosts = 0
        console.debug("Stat costs", data.statCost)

        baseStats.forEach((bs) => {
            if (data.statCost && reinc.stats) {
                const reincStat = reinc.stats.find((rs) => rs.name === bs)
                if (reincStat && reincStat.trained > 0) {
                    statCosts = statCosts + data.statCost.slice(0, reincStat.trained + 1).reduce((l1, l2) => l1 + l2, 0)
                }
            }
        })
        console.debug("Stat costs", statCosts)

        return statCosts
    }

    const getHpmax = () => {
        let hpmax = -1
        if (!reinc.race) {
            return -1
        }
        // TODO : Move to wishes
        if (reinc.wishes.find(w => w.name === "lesser physical improvement" && w.applied)) {
            hpmax += (0.75 * (reinc.race?.con) + 0.5 * reinc.race?.size + 25)
        }
        // TODO : Move to wishes
        if (reinc.wishes.find(w => w.name === "greater physical improvement" && w.applied)) {
            hpmax += (1.5 * (reinc.race?.con) + reinc.race?.size + 50)
        }

        const con = (reinc.guildUtils.getStatTotalFromGuilds("constitution")) || 0
        const hitPoints = (reinc.guildUtils.getStatTotalFromGuilds("hit points")) || 0
        hpmax += hitPoints
        hpmax += Math.round(2 * (reinc.race.size) + (con * 3))
        return Math.round(hpmax)
    }

    const getSpmax = () => {
        let spmax = -1
        if (!reinc.race) {
            return -1
        }
        // TODO : Move to wishes
        if (reinc.wishes.find(w => w.name === "lesser magical improvement" && w.applied)) {
            spmax += (0.75 * (reinc.race?.int) + 0.5 * reinc.race?.wis + 50)
        }
        // TODO : Move to wishes
        if (reinc.wishes.find(w => w.name === "greater magical improvement" && w.applied)) {
            spmax += (1.5 * (reinc.race?.int) + reinc.race?.wis + 100)
        }

        const int = (reinc.guildUtils.getStatTotalFromGuilds("intelligence")) || 0
        const wis = (reinc.guildUtils.getStatTotalFromGuilds("wisdom")) || 0
        const spellPoints = (reinc.guildUtils.getStatTotalFromGuilds("spell points")) || 0
        spmax += spellPoints
        spmax += (3 * wis + 4 * int)
        return Math.round(spmax)
    }

    const getReincStat = (stat: string) => {
        if (!reinc.race) {
            return -1
        }
        const raceFactor = Object.entries(reinc.race)
            .find((entry) => {
                return entry[0] === simplifyStat(stat)
            })?.at(1) as number || 100

        const reincStat = 100 + ((reinc.guildUtils.getStatTotalFromGuilds(stat)) || 0) +
            (reinc.stats.find(s => simplifyStat(s.name) === simplifyStat(stat))?.trained || 0)

        return Math.round((raceFactor * reincStat) / 100)
    }

    const getGuildResists = (): ReincResist[] => {
        const resistances: ReincResist[] = []
        const flatGuilds = reinc.guildUtils.getReincGuildsFlat()
        console.debug("FALTL", flatGuilds)
        const guildLevels = flatGuilds.map((g) => Array.from(g.levelMap.values()).slice(0, g.trained))
        console.debug("Trained GUILD LEVELS", guildLevels)
        const allGuildLevelsList = guildLevels.map((e1) => e1)
        console.debug("ALL GUILD LEVELS LIST", allGuildLevelsList)
        const allGuildLevels = allGuildLevelsList.reduce((gs1, gs2) => gs1.concat(gs2), [])
        const stats = allGuildLevels.map(gl => gl.stats)
        const allStats = stats.reduce((s1, s2) => s1.concat(s2), [])

        resistanceNames.forEach((rn) => {
            const res = reinc.guildUtils.getStatTotalFromGuilds(rn)
            const totalAmount = allStats.filter(s => simplifyStat(s.name) === simplifyStat(rn))
                .map(s => s.value)
                .reduce((s1, s2) => s1 + s2, 0)
            console.debug("resistance", rn, res)

            if (totalAmount > 0) {
                resistances.push({name: rn as ResistanceTypeName, value: totalAmount})
            }
        })
        return sortByName<ReincResist>(resistances)
    }

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
        getGuildResists
    }

}