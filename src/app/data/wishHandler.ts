import {ReincContextType} from "@/app/contexts/reincContext";
import {baseStats, damageTypes} from "@/app/parsers/raceParser";

export const Greater = [
    "superior stats"
    , "superior knowledge"
    , "greater magical improvement"
    , "greater physical improvement"
    , "superior battle regeneration"
    , "greater casting haste"
    , "superior endurance"
]
export const Lesser = [
    "better stats"
    , "better knowledge"
    , "lesser magical improvement"
    , "lesser physical improvement"
    , "lesser battle regeneration"
    , "lesser casting haste"
    , "improved battle regeneration"
    , "improved endurance"
]

export const improvedStat = [
    ...baseStats.map((bs) => "improved " + bs)
]
export const improvedResistance = [
    ...damageTypes.map((dt) => dt + " resistance")
]
export const Minor = [
    "thick skin"
    , "ambidexterity"
    , "true seeing"
    , "giant size"
    , "lucky"
    , "resist"
    , ...improvedStat
    , ...improvedResistance
]

export type WishName = typeof Greater[number] | typeof Lesser[number] | typeof Minor[number]

export enum WishType {
    GREATER = "GREATER",
    LESSER = "LESSER",
    MINOR = "MINOR",
}

export type Wish = {
    name: WishName,
    applied: boolean
    type: WishType
}

export type WishWithId = {
    id: number
} & Wish

export const getDefaultWishes = (): WishWithId[] => {
    let idx: number = 0
    return [
        ...(Greater.map((g) => ({
            name: g,
            id: idx++,
            type: WishType.GREATER,
            applied: false,
        })) || []),
        ...(Lesser.map((g) => ({
            name: g,
            id: idx++,
            type: WishType.LESSER,
            applied: false,
        })) || []),
        ...(Minor.map((g) => ({
            name: g,
            id: idx++,
            type: WishType.MINOR,
            applied: false,
        })) || []),
    ]
}
export default function WishHandler(reinc: ReincContextType) {
    let newData = {...reinc}


    function wishApplied(name: WishName) {
        return reinc.wishes.find((w) => w.name === name && w.applied)
    }

    function applyWish(name: WishName, wishName: WishName, type: WishType, doApply?: () => boolean) {
        newData = {...reinc}
        if (name !== wishName) {
            return
        }
        let applySuccess = false
        if (!wishApplied(name)) {
            if (doApply) {
                applySuccess = doApply()
            } else {
                applySuccess = true
            }
            const existingNonAppliedWish = newData.wishes.find((w) => w.name === name && !w.applied)
            console.debug("APPLYING WISH", name, applySuccess, existingNonAppliedWish !== undefined)
            if (applySuccess || (!applySuccess && !existingNonAppliedWish) || (existingNonAppliedWish && applySuccess)) {
                reinc.setWishes([...newData.wishes.filter((w) => w.name !== name), {
                    name: name,
                    applied: applySuccess,
                    type: type
                }])
            }
        }
    }

    function cancelWish(name: WishName, wishName: WishName, type: WishType, doApply?: () => boolean) {
        newData = {...reinc}

        if (name !== wishName) {
            return
        }
        let cancelSuccess = false
        if (doApply) {
            cancelSuccess = doApply()
        } else {
            cancelSuccess = true
        }

        if (cancelSuccess) {
            reinc.setWishes(newData.wishes = [...newData.wishes.filter((w) => w.name !== name)])
        }
    }

    return {
        apply: (name: WishName): ReincContextType => {

            applyWish(name, "superior stats", WishType.GREATER, () => {
                reinc.setBonusBaseStats(
                    newData.bonusBaseStats.map((stat) => {
                        return {name: stat.name, percent: stat.percent + 10}
                    }))
                return true

            })

            applyWish(name, "better stats", WishType.LESSER, () => {
                reinc.setBonusBaseStats(
                    newData.bonusBaseStats.map((stat) => {
                        return {name: stat.name, percent: stat.percent + 5}
                    }))
                return true
            })

            applyWish(name, "superior knowledge", WishType.GREATER, () => {
                    newData.skillMax = newData.skillMax + 10
                    newData.spellMax = newData.spellMax + 10
                    reinc.setSkillMax(newData.skillMax)
                    reinc.setSpellMax(newData.spellMax)
                    return true
                }
            )

            applyWish(name, "better knowledge", WishType.LESSER, () => {
                    newData.skillMax = newData.skillMax + 5
                    newData.spellMax = newData.spellMax + 5
                    reinc.setSkillMax(newData.skillMax)
                    reinc.setSpellMax(newData.spellMax)
                    return true

                }
            )

            applyWish(name, "greater magical improvement", WishType.GREATER)
            applyWish(name, "lesser magical improvement", WishType.LESSER)


            applyWish(name, "greater physical improvement", WishType.GREATER)
            applyWish(name, "lesser physical improvement", WishType.LESSER)

            applyWish(name, "superior battle regeneration", WishType.GREATER)
            applyWish(name, "improved battle regeneration", WishType.LESSER)

            applyWish(name, "superior endurance", WishType.GREATER)
            applyWish(name, "improved endurance", WishType.LESSER)

            applyWish(name, "greater casting haste", WishType.GREATER)
            applyWish(name, "lesser casting haste", WishType.LESSER)


            applyWish(name, "thick skin", WishType.MINOR)
            applyWish(name, "lucky", WishType.MINOR)
            applyWish(name, "true seeing", WishType.MINOR)
            applyWish(name, "giant size", WishType.MINOR)
            applyWish(name, "ambidexterity", WishType.MINOR)

            improvedStat.forEach((s) => {
                applyWish(name, s, WishType.MINOR)
            })

            improvedResistance.forEach((t) => {
                applyWish(name, t, WishType.MINOR)
            })
            return newData
        },
        cancel: (name: WishName): ReincContextType => {

            const newData = {...reinc}

            cancelWish(name, "superior stats", WishType.GREATER, () => {
                reinc.setBonusBaseStats(
                    newData.bonusBaseStats.map((stat) => {
                        return {name: stat.name, percent: stat.percent - 10}
                    }))
                return true
            })

            cancelWish(name, "better stats", WishType.LESSER, () => {
                reinc.setBonusBaseStats(
                    newData.bonusBaseStats.map((stat) => {
                        return {name: stat.name, percent: stat.percent - 5}
                    }))
                return true
            })

            cancelWish(name, "superior knowledge", WishType.GREATER, () => {
                newData.skillMax = newData.skillMax - 10
                newData.spellMax = newData.spellMax - 10
                reinc.setSkillMax(newData.skillMax)
                reinc.setSpellMax(newData.spellMax)
                return true
            })

            cancelWish(name, "better knowledge", WishType.LESSER, () => {
                newData.skillMax = newData.skillMax - 5
                newData.spellMax = newData.spellMax - 5
                reinc.setSkillMax(newData.skillMax)
                reinc.setSpellMax(newData.spellMax)
                return true

            })

            cancelWish(name, "greater magical improvement", WishType.GREATER)
            cancelWish(name, "lesser magical improvement", WishType.LESSER)

            cancelWish(name, "greater physical improvement", WishType.GREATER)
            cancelWish(name, "lesser physical improvement", WishType.LESSER)

            cancelWish(name, "superior battle regeneration", WishType.GREATER)
            cancelWish(name, "improved battle regeneration", WishType.LESSER)

            cancelWish(name, "greater casting haste", WishType.GREATER)
            cancelWish(name, "lesser casting haste", WishType.LESSER)

            cancelWish(name, "superior endurance", WishType.GREATER)
            cancelWish(name, "improved endurance", WishType.LESSER)

            improvedStat.forEach((s) => {
                cancelWish(name, s, WishType.MINOR)
            })

            improvedResistance.forEach((t) => {
                cancelWish(name, t, WishType.MINOR)
            })

            return newData
        }
    }
}