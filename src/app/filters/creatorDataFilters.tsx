'use client'
import {FilteredData, MAX_LEVEL, ReincContextType} from "@/app/contexts/reincContext";
import {Ability} from "@/app/parsers/abilityCostParser";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {GuildLevels} from "@/app/parsers/guildsFileParser";
import {FullGuild, MainGuild} from "@/app/service/guildService";
import {GuildAbility} from "@/app/parsers/guildParser";

export type CreatorDataFilterType = {
    doFilter: () => FilteredData
}

export function onlyUnique(value: { name: string }, index: any, array: any[]) {
    return array.findIndex((v: { name: string }) => {
        return value.name === v.name
    }) === index;
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
            guilds: reinc.guildService.getMainGuilds() as FullGuild[],
            skills: reinc.skills,
            spells: reinc.spells
        }
        const newGuilds = GuildsByAbilitiesFilter(filteredData, creatorDataContext, reinc).doFilter()

        newFilteredData = {
            ...newFilteredData,
            ...newGuilds
        }
        setFilteredData(
            {
                ...filteredData,
                ...newFilteredData,
            }
        )


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


        console.log("Guildcount", newFilteredData.guilds?.length)
        console.log("Skillcount", newFilteredData.skills?.length)
        console.log("Spellcount", newFilteredData.spells?.length)


        const count = (filteredData.guilds?.length || 0) +
            (filteredData?.filteredAbilities && filteredData.filteredAbilities()?.length || 0)

        console.log("FILTERCOUNT", filteredData.filterCount)


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
            const guildAbilities: GuildAbility[] = []
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

            if (!guilds) {
                return {
                    filterCount: filteredData.filterCount,
                    skills: reinc.skills,
                    spells: reinc.spells,
                    guilds: reinc.guilds
                }
            }
            guilds?.forEach((guild) => {
                for (let i = guild.levels; i > 0; i--) {
                    const level = guild.levelMap.get(i.toString())
                    level?.abilities.forEach((guildAbility: GuildAbility) => {
                        if (!guildAbilities.find((ga: GuildAbility) => ga.name === guildAbility.name)) {
                            guildAbilities.push(guildAbility)
                        }
                    })
                }
            })

            let newSkills: Ability[] = []
            let newSpells: Ability[] = []

            if (reinc.level === 0) {
                newSkills = (reinc?.skills)?.filter((skill: Ability) => {
                    return guildAbilities.find((ga) => ga.name === skill.name)
                }) || []

                newSpells = (reinc?.spells)?.filter((spell: Ability) => {
                    return guildAbilities.find((ga) => ga.name === spell.name)
                }) || []
            } else {
                newSkills = (filteredData.skills || reinc?.skills)?.filter((skill: Ability) => {
                    return guildAbilities.find((ga) => ga.name === skill.name)
                }) || []
                newSpells = (filteredData.spells || reinc?.spells)?.filter((spell: Ability) => {
                    return guildAbilities.find((ga) => ga.name === spell.name)
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
                    g.subGuilds.forEach((sg => {
                        filterByAbility(sg, ability)
                    }))
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
            console.log("NEWGUILDS", newGuilds)

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