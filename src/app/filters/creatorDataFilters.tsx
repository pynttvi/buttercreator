'use client'
import {FilteredData, ReincContextType} from "@/app/contexts/reincContext";
import {Ability} from "@/app/parsers/abilityCostParser";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {FullGuild} from "@/app/service/guildService";
import {GuildAbility} from "@/app/parsers/guildParser";
import {onlyUniqueNameWithHighestMax, sortByName} from "@/app/filters/utils";

export type CreatorDataFilterType = {
    doFilter: () => FilteredData
}


export const trainedAbilities = (reinc: ReincContextType) => {
    const skills = reinc.skills.filter((s) => s.trained > 0)
    const spells = reinc.spells.filter((s) => s.trained > 0)
    return {skills, spells, totalCount: skills.length + spells.length}
}

export const doFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincContextType | null, lastCount?: number) => {

    if (reinc) {
        const {filteredData, setFilteredData} = reinc


        let newFilteredData: FilteredData = {
            filterCount: 0,
            skills: reinc.skills,
            spells: reinc.spells
        }


        if(reinc.level === 0 && (reinc.skills.length > 0 || reinc.spells.length > 0)){
            const newGuilds = GuildsByAbilitiesFilter(filteredData, creatorDataContext, reinc).doFilter()

            newFilteredData = {
                ...newFilteredData,
                ...newGuilds
            }
        }

        const filteredAbilities = AbilitiesByGuildsFilter(filteredData, creatorDataContext, reinc).doFilter()
        newFilteredData = {
            ...newFilteredData,
            ...filteredAbilities
        }


        if (newFilteredData.skills?.length === 0 && newFilteredData.spells?.length === 0) {
            newFilteredData.skills = reinc.skills
            newFilteredData.spells = reinc.spells
        }

        setFilteredData(
            {
                ...filteredData,
                ...newFilteredData,
            }
        )

        const count = (filteredData.guilds?.length || 0) +
            (filteredData?.filteredAbilities && filteredData.filteredAbilities()?.length || 0)


        if (count === lastCount) {
            return
        } else {
        }


        doFilter(creatorDataContext, reinc, count)

    }
}

export const AbilitiesByGuildsFilter = (filteredData: FilteredData, creatorDataContext: CreatorDataContextType, reinc: ReincContextType): CreatorDataFilterType => {
    const {creatorData} = creatorDataContext

    return {
        doFilter: (): FilteredData => {
            let guildAbilities: GuildAbility[] = []
            let guilds: FullGuild[] = []
            const allGuilds = reinc.guildService.getMainGuilds() as FullGuild[]
            //
            if (filteredData.guilds?.length !== 0 && reinc.level === 0) {
                guilds = (reinc.filteredData.guilds || []) as FullGuild[]
            }

            if (reinc.guilds.length !== 0) {
                guilds = reinc.guilds
            }

            if (guilds.length === 0) {
                guilds = allGuilds
            }

            const reincSkills = [...reinc.skills]
            const reincSpells = [...reinc.spells]

            if (!guilds) {
                return {
                    filterCount: filteredData.filterCount,
                    skills: reincSkills,
                    spells: reincSpells,
                    guilds: reinc.guilds
                }
            }
            let guildIdx: number = 0



            function addAbilities(guild: FullGuild) {
                const reincGuild = reinc.guildService.getReincGuildByName(guild.name)
                if (reincGuild) {
                    guildIdx = guildIdx + 1000
                    guild.subGuilds.forEach((sg) => {
                        addAbilities(sg)
                    })
                    for (let i = guild.levels; i > 0; i--) {
                        const level = guild.levelMap.get(i.toString())

                        level?.abilities.forEach((guildAbility: GuildAbility, idx) => {
                            guildAbilities.push({...guildAbility, id: guildIdx + idx, guild: reincGuild})

                        })
                    }
                }
            }

            guilds?.forEach((guild) => {
                addAbilities(guild)
            })

            guildAbilities = onlyUniqueNameWithHighestMax(guildAbilities).map((ga, idx) => {
                return {...ga, id: idx}
            })

            console.debug("FILTERING ABILITIES", guildAbilities)

            let newSkills: Ability[] = []
            let newSpells: Ability[] = []

            if (reinc.level === 0) {
                newSkills = reincSkills.filter((skill: Ability) => {
                    return guildAbilities.find((ga) => ga.name === skill.name)
                }) || []

                newSpells = reincSkills.filter((spell: Ability) => {
                    return guildAbilities.find((ga) => ga.name === spell.name)
                }) || []
            } else {
                newSkills = guildAbilities.filter((ga) => ga.type === "skill").map((ga, id) => {
                    const reincSkill = reincSkills.find((rs) => rs.name === ga.name)
                    return {...ga, ...reincSkill, max: Math.max(ga.max, reincSkill?.max || 0)} as Ability
                }) || []

                newSpells = guildAbilities.filter((ga) => ga.type === "spell").map((ga, id) => {
                    const reincSpell = reincSpells.find((rs) => rs.name === ga.name)
                    return {...ga, ...reincSpell, max: Math.max(ga.max, reincSpell?.max || 0)} as Ability
                }) || []

            }

            let count = filteredData.filterCount
            if (newSkills.length > 0 || newSpells.length > 0) {
                count = 1
            }

            return {filterCount: count, skills: newSkills, spells: newSpells}
        }
    }
}

export const GuildsByAbilitiesFilter = (filteredData: FilteredData, creatorDataContext: CreatorDataContextType, reinc: ReincContextType): CreatorDataFilterType => {

    return {
        doFilter: (): FilteredData => {
            let guilds: FullGuild[] = []

            const oldFilteredData = {...filteredData}
            const allGuilds = reinc.guildService.getMainGuilds() as FullGuild[]

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


            if (reinc.level === 0 && totalCount > 0) {
                guilds = filteredData.guilds as FullGuild[]
            } else {
                allGuilds.forEach((g) => {
                    addGuild(g)
                })
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
            } else {

            }
            newGuilds = (newGuilds?.length === 0 ? guilds : newGuilds) as FullGuild[]

            let filterCount = 0
            if (newGuilds.length > 0) {
                filterCount = 1
            }
            return {
                ...filteredData,
                guilds: newGuilds,
                filterCount
            }
        }
    }
}