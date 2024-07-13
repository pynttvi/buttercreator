import {ReincContextType} from "@/app/contexts/reincContext";
import {Lesser, minorWishCosts, RESIST_WISH_NAME_SUFFIX, STAT_WISH_NAME_PREFIX, WishType} from "@/app/data/wishHandler";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {Ability} from "@/app/parsers/abilityCostParser";
import {baseStats} from "@/app/parsers/raceParser";

export default function Counters(reinc: ReincContextType, creatorDataContext: CreatorDataContextType) {

    const data = creatorDataContext.creatorData

    const costFactors = [0, 1, 2, 4, 8, 13, 22, 38, 64, 109, 184, 310, 523, 882, 1487, 2506,
        4222, 7115, 11989, 20202, 34040, 999999, 999999, 999999]

    const countTaskPoints = (): number => {
        let tpCount = 0

        if (data.wishCost) {
            console.debug("Wishcosts", data.wishCost)
            const greaterCount = reinc.wishes.filter((w) => w.type === WishType.GREATER).length
            tpCount = tpCount + (greaterCount > 0 ? data.wishCost.slice(Lesser.length, Lesser.length + greaterCount + 1)
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
        console.log("QP costs", data.qpCost)

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
        target.filter((a) => a.trained > 0 && (!name || name === a.name)).forEach((a: Ability) => {
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

        return {exp: abilityCost, gold: (abilityCost * 0.044444)}

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

    return {
        countTaskPoints,
        countQpCost,
        countLevelCost,
        countLevelCostWithQps,
        countGuildLevelCost,
        countAbilitiesCost,
        countStats,
    }

}