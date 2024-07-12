import {ReincContextType} from "@/app/contexts/reincContext";
import {Lesser, minorWishCosts, RESIST_WISH_NAME_SUFFIX, STAT_WISH_NAME_PREFIX, WishType} from "@/app/data/wishHandler";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";

export default function Counters(reinc: ReincContextType, creatorDataContext: CreatorDataContextType) {

    const data = creatorDataContext.creatorData
    return {
        countTaskPoints: (): number => {
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
        },
        countLevelCost: (): number => {
            let levelCost = 0

            if (data.levelCosts && reinc.level && reinc.level > 0) {
                console.debug("Level costs", data.levelCosts)
                levelCost = data.levelCosts.slice(0, reinc.level).reduce((l1, l2) => l1 + l2, 0)
            }
            console.debug("Level cost", levelCost)

            return levelCost
        }
    }

}