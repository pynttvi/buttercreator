'use client'
import {Ability} from "@/app/parsers/abilityCostParser";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {FullGuild} from "@/app/service/guildService";
import {GuildAbility} from "@/app/parsers/guildParser";
import {onlyUniqueNameWithHighestMax, sortByName} from "@/app/filters/utils";
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

            if (reinc.level !== 0) {
                guilds = reinc.guilds
            } else {
                guilds = allGuilds
            }


            let allSkills: ReincAbility[] = reinc.skills.length === 0 ? reinc.allSkills : reinc.skills
            let allSpells: ReincAbility[] = reinc.spells.length === 0 ? reinc.allSpells : reinc.spells

            let newSkills: ReincAbility[] = []
            let newSpells: ReincAbility[] = []
            const flatGuilds = reinc.guildService.getReincGuildsFlat()
            console.debug("FLAT GUILDS", flatGuilds)
            console.debug("REINC SKILLS", allSkills)
            allSkills.forEach(rs => {
                let enabled = true
                if (reinc.level > 0 && !flatGuilds.find(fg => fg.name === rs.guild?.name)) {
                    enabled = false
                }
                newSkills.push({
                    ...rs,
                    enabled: enabled
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
                })
            })


            console.debug("NEW SKILLS", newSkills.filter(ns => ns.enabled))
            console.debug("NEW SPELLS", newSpells.filter(ns => ns.enabled))
            console.debug("Attack", newSkills.find(ns => ns.name === "attack"))

            return {
                skills: sortByName<ReincAbility>(onlyUniqueNameWithHighestMax(newSkills)),
                spells: sortByName<ReincAbility>(onlyUniqueNameWithHighestMax(newSpells))
            }
        }
    }
}

export const GuildsByAbilitiesFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincContextType): CreatorDataFilterType => {

    return {
        doFilter: (): { guilds: FullGuild[] } => {
            let guilds: FullGuild[] = []

            const allGuilds = reinc.allGuilds as FullGuild[]

            const {totalCount} = trainedAbilities(reinc)


            function addGuild(guild: FullGuild) {
                if (!guilds.find((g: FullGuild) => g.name === guild.name)) {
                    const existingGuild = reinc.guildService.getReincGuildByName(guild.name)
                    guilds.push(existingGuild || guild as FullGuild)
                }
            }

            function addNewGuild(guild: FullGuild) {
                if (!newGuilds.find((g: FullGuild) => g.name === guild.name)) {
                    const existingGuild = reinc.guildService.getReincGuildByName(guild.name)
                    newGuilds.push(existingGuild || guild as FullGuild)
                }
            }


            if (reinc.level === 0) {
                allGuilds.forEach((g) => {
                    addGuild(g)
                })
            } else {
                reinc.guilds.forEach(rg => addGuild(rg))
            }


            let newGuilds: FullGuild[] = []

            function filterByAbility(g: FullGuild, ability: Ability) {
                g.subGuilds.forEach((sg => {
                    filterByAbility(sg, ability)
                }))
                for (let i = g.levelMap.size; i > 0; i--) {
                    const level = g.levelMap.get(i.toString())
                    level?.abilities.forEach((guildAbility: GuildAbility) => {
                        if (ability.name.trim() === guildAbility.name.trim() && ability.trained <= guildAbility.max) {
                            if (g.guildType === "sub") {
                                addNewGuild(g.mainGuild as FullGuild)
                            }
                            addNewGuild(g)
                        }
                    })
                }
            }

            if (reinc.guilds.length === 0) {
                const trainedSkills = reinc.skills.filter((s) => s.trained > 0)
                trainedSkills.forEach((ability) => {
                    guilds.forEach((g) => {
                        filterByAbility(g, ability);
                    })
                })

                const trainedSpells = reinc.spells.filter((s) => s.trained > 0)
                trainedSpells.forEach((ability) => {
                    guilds.forEach((g) => {
                        filterByAbility(g, ability);
                    })
                })
            }
            newGuilds = (newGuilds?.length === 0 ? guilds : newGuilds) as FullGuild[]

            console.debug("Filtering guilds", newGuilds)
            return {guilds: [...newGuilds]}
        }
    }
}