'use client'
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {FullGuild} from "@/app/utils/guildUtils";
import {onlyUniqueNameWithHighestMax, sortByName} from "@/app/utils/utils";
import {ReincAbility, ReincContextType} from "@/app/contexts/reincContext";

export type FilterDataType = {
    skills: ReincAbility[], spells: ReincAbility[], guilds: FullGuild[]
}
export type CreatorDataFilterType = {
    doFilter: () => Partial<FilterDataType>
}


export const trainedAbilities = (reinc: ReincContextType) => {
    const skills = reinc.skills.filter((s) => s.trained > 0)
    const spells = reinc.spells.filter((s) => s.trained > 0)
    return {skills, spells, totalCount: skills.length + spells.length}
}

export const doFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincContextType, lastCount?: number): FilterDataType | undefined => {
    if (reinc) {
        const abilities = AbilitiesByGuildsFilter(creatorDataContext, reinc).doFilter() as {
            skills: ReincAbility[],
            spells: ReincAbility[]
        }
        let guilds = {guilds: reinc.guilds}

        if (reinc.level === 0) {
            guilds = GuildsByAbilitiesFilter(creatorDataContext, reinc).doFilter() as {
                guilds: FullGuild[]
            }
        }
        return {
            skills: abilities.skills || [],
            spells: abilities.spells || [],
            guilds: guilds.guilds || []
        }


    } else {
        return {
            skills: [],
            spells: [],
            guilds: [],
        }
    }
}


export const AbilitiesByGuildsFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincContextType): CreatorDataFilterType => {
    const {creatorData} = creatorDataContext

    return {
        doFilter: () => {
            let guilds: FullGuild[] = []
            const allGuilds = reinc.allGuilds

            if (reinc.level === 0) {
                return {
                    skills: reinc.allSkills,
                    spells: reinc.allSpells,
                }
            }

            console.debug("REINC SPELLS", reinc.spells)
            let allSkills: ReincAbility[] = reinc.level === 0 ? reinc.allSkills : reinc.skills
            let allSpells: ReincAbility[] = reinc.level === 0 ? reinc.allSpells : reinc.spells

            let newSkills: ReincAbility[] = []
            let newSpells: ReincAbility[] = []
            const flatGuilds = reinc.level === 0 ? reinc.guildUtils.getAllGuildsFlat() : reinc.guildUtils.getReincGuildsFlat()
            console.debug("FLAT GUILDS", flatGuilds)
            console.debug("REINC SKILLS", allSkills)
            console.debug("LEVEL", reinc.level)
            allSkills.forEach(rs => {
                let enabled = true
                if (reinc.level > 0 && !flatGuilds.find(fg => fg.name === rs.guild?.name)) {
                    enabled = false
                }
                newSkills.push({
                    ...rs,
                    enabled: enabled,
                    max: reinc.guildUtils.maxForGuilds(rs, flatGuilds)
                })
            })

            allSpells.forEach(rs => {
                let enabled = true
                if (reinc.level > 0 && !flatGuilds.find(fg => fg.name === rs.guild?.name)) {
                    enabled = false
                }
                newSpells.push({
                    ...rs,
                    enabled: enabled,
                    max: reinc.guildUtils.maxForGuilds(rs, flatGuilds)
                })
            })


            console.debug("NEW SKILLS", newSkills)
            console.debug("NEW SPELLS", sortByName<ReincAbility>(onlyUniqueNameWithHighestMax(newSpells.filter(ns => ns.enabled))))
            console.debug("Attack", newSkills.find(ns => ns.name === "attack"))

            return {
                skills: newSkills,
                spells: newSpells
            }
        }
    }
}

export const GuildsByAbilitiesFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincContextType): CreatorDataFilterType => {

    return {
        doFilter: (): { guilds: FullGuild[] } => {
            let newGuilds: FullGuild[] = []

            if (reinc.level > 0) {
                return {guilds: reinc.guilds}
            }

            const allGuilds = reinc.allGuilds as FullGuild[]
            const flatGuilds = reinc.guildUtils.getAllGuildsFlat() as FullGuild[]

            const trainedAbilities = [...reinc.filteredData.skills, ...reinc.filteredData.spells].filter(a => a.trained > 0)

            console.debug("TRAINED ABILITIES", trainedAbilities)
            const tempGuilds: FullGuild[] = []
            flatGuilds.forEach((g) => {
                Array.from(g.levelMap.entries()).forEach((entry) => {
                    entry[1].abilities.forEach(a1 => {
                        if (trainedAbilities.find(ta => ta.name == a1.name)) {
                            if (!tempGuilds.find(tg => tg.name === g.name)
                            ) {
                                tempGuilds.push(g)
                            }
                        }
                    })
                })
            })
            newGuilds = allGuilds.filter((ag => {
                let enabled = false
                if (tempGuilds.find(tg => tg.name === ag.name)) {
                    enabled = true
                }
                ag.subGuilds.forEach((sg) => {
                    if (tempGuilds.find(tg => tg.name === sg.name)) enabled = true
                    sg.subGuilds.forEach((sg1) => {
                        if (tempGuilds.find(tg => tg.name === sg1.name)) enabled = true
                    })
                })

                return enabled
            }))

            if (newGuilds.length === 0) {
                newGuilds = allGuilds
            }
            console.debug("Filtering guilds", newGuilds)
            return {guilds: [...newGuilds]}
        }
    }
}