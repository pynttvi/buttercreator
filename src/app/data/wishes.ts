import {ReincType} from "@/app/contexts/reincContext";
import {BaseStatName, baseStats, DamageTypeName, damageTypes} from "@/app/parsers/raceParser";

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
export const Minor = [
    "thick skin"
    , "ambidexterity"
    , "true seeing"
    , "giant size"
    , "lucky"
    , "resist"
    , ...baseStats
    , ...damageTypes
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
export default function Wishes(reinc: ReincType) {
    const newData = {...reinc}


    function wishApplied(name: WishName) {
        return reinc.wishes.find((w) => w.name === name)
    }

    function applyWish<T extends WishType>(name: WishName, type: WishType, doApply?: () => void) {
        if (!wishApplied(name)) {
            newData.wishes = [...newData.wishes, {name: name, applied: true, type: type}]
        }
        if (doApply) doApply()
    }

    function cancelWish(name: WishName, type: WishType, doApply?: () => void) {
        if (wishApplied(name)) {
            newData.wishes = [...newData.wishes, {name: name, applied: false, type: type}]
        }
        if (doApply) doApply()
    }

    return {
        apply: (name: WishName): ReincType | undefined => {

            applyWish("superior stats", WishType.GREATER, () => {
                    baseStats.forEach((stat: BaseStatName) => {
                        if (newData.race) {
                            const raceStat: number = newData.race[stat] || -1
                            if (raceStat !== -1) {
                                // @ts-ignore
                                newData.race[stat] = newData.stats[stat] * 1.1
                            }
                            newData.wishes = [...newData.wishes, {
                                name: "superior stats",
                                type: WishType.GREATER,
                                applied: true
                            }]
                        }
                    })
                }
            )

            applyWish("better stats", WishType.LESSER, () => {
                    baseStats.forEach((stat: BaseStatName) => {
                        if (newData.race) {
                            const raceStat: number = newData.race[stat] || -1
                            if (raceStat !== -1) {
                                // @ts-ignore
                                newData.race[stat] = newData.stats[stat] * 1.05
                            }
                            newData.wishes = [...newData.wishes, {
                                name: "superior stats",
                                type: WishType.LESSER,
                                applied: true
                            }]
                        }
                    })
                }
            )

            applyWish("superior knowledge", WishType.GREATER, () => {
                    newData.skillMax += 10
                    newData.spellMax += 10
                    newData.wishes = [...newData.wishes, {
                        name: "superior knowledge",
                        type: WishType.GREATER,
                        applied: true
                    }]
                }
            )

            applyWish("better knowledge", WishType.LESSER, () => {
                    newData.skillMax += 5
                    newData.spellMax += 5
                    newData.wishes = [...newData.wishes, {name: "better knowledge", type: WishType.LESSER, applied: true}]
                }
            )

            applyWish("greater magical improvement", WishType.GREATER)
            applyWish("lesser magical improvement", WishType.LESSER)


            applyWish("greater physical improvement", WishType.GREATER)
            applyWish("lesser physical improvement", WishType.LESSER)

            applyWish("superior battle regeneration", WishType.GREATER)
            applyWish("improved battle regeneration", WishType.LESSER)

            applyWish("superior endurance", WishType.GREATER)
            applyWish("improved endurance", WishType.LESSER)

            applyWish("greater casting haste", WishType.GREATER)
            applyWish("lesser casting haste", WishType.LESSER)


            applyWish("thick skin", WishType.MINOR)
            applyWish("lucky", WishType.MINOR)
            applyWish("true seeing", WishType.MINOR)
            applyWish("giant size", WishType.MINOR)
            applyWish("ambidexterity", WishType.MINOR)

            baseStats.forEach((s) => {
                applyWish(s, WishType.MINOR)
            })

            damageTypes.forEach((t) => {
                applyWish(t, WishType.MINOR)
            })
            return newData
        },
        cancel: (name: WishName): ReincType | undefined => {

            const newData = {...reinc}

            cancelWish("superior stats", WishType.GREATER, () => {
                baseStats.forEach((stat: BaseStatName) => {
                    if (newData.race) {
                        const raceStat: number = newData.race[stat] || -1
                        if (raceStat !== -1) {
                            // @ts-ignore
                            newData.race[stat] = newData.stats[stat] / 1.1
                        }
                        newData.wishes = [...newData.wishes, {
                            name: "superior stats",
                            type: WishType.GREATER,
                            applied: false
                        }]

                    }
                })
            })

            cancelWish("better stats", WishType.LESSER, () => {
                baseStats.forEach((stat: BaseStatName) => {
                    if (newData.race) {
                        const raceStat: number = newData.race[stat] || -1
                        if (raceStat !== -1) {
                            // @ts-ignore
                            newData.race[stat] = newData.stats[stat] / 1.05
                        }
                        newData.wishes = [...newData.wishes, {
                            name: "superior stats",
                            type: WishType.LESSER,
                            applied: false
                        }]

                    }
                })
            })

            cancelWish("superior knowledge", WishType.GREATER, () => {
                newData.skillMax -= 10
                newData.spellMax -= 10
                newData.wishes = [...newData.wishes, {
                    name: "superior knowledge",
                    type: WishType.GREATER,
                    applied: false
                }]
            })

            cancelWish("better knowledge", WishType.LESSER, () => {
                newData.skillMax -= 5
                newData.spellMax -= 5
                newData.wishes = [...newData.wishes, {
                    name: "superior knowledge",
                    type: WishType.LESSER,
                    applied: false
                }]
            })

            cancelWish("greater magical improvement", WishType.GREATER)
            cancelWish("lesser magical improvement", WishType.LESSER)

            cancelWish("greater physical improvement", WishType.GREATER)
            cancelWish("lesser physical improvement", WishType.LESSER)

            cancelWish("superior battle regeneration", WishType.GREATER)
            cancelWish("improved battle regeneration", WishType.LESSER)

            cancelWish("greater casting haste", WishType.GREATER)
            cancelWish("lesser casting haste", WishType.LESSER)

            cancelWish("superior endurance", WishType.GREATER)
            cancelWish("improved endurance", WishType.LESSER)

            baseStats.forEach((s) => {
                cancelWish(s, WishType.MINOR)
            })

            damageTypes.forEach((t) => {
                cancelWish(t, WishType.MINOR)
            })

            return newData
        }
    }
}