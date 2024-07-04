import {FilteredData, MAX_LEVEL, ReincContextType} from "@/app/contexts/reincContext";
import {Guild, GuildAbility, GuildLevel} from "@/app/parsers/guildParser";
import {Ability} from "@/app/parsers/abilityCostParser";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {GuildLevels} from "@/app/parsers/guildsFileParser";

export type CreatorDataFilterType = {
    doFilter: () => any
}
export function onlyUnique(value: {name: string}, index: any, array: any[]) {
    return array.findIndex((v: {name: string}) => {
        return value.name === v.name
    }) === index;
}

export const doFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincContextType | null, lastCount?: number) => {

    if (reinc) {
        const {filteredData, setFilteredData} = reinc

        let newFilteredData: FilteredData = {guilds: AbilityGuildFilter(filteredData, creatorDataContext, reinc).doFilter()}

        const filteredAbilities = GuildSkillFilter(filteredData, creatorDataContext, reinc).doFilter()

        if (reinc.level === MAX_LEVEL) {
            newFilteredData.skills = filteredAbilities.spells
            newFilteredData.spells = filteredAbilities.spells
        }

        const count = (filteredData.guilds?.length || 0) +
            (filteredData?.filteredAbilities && filteredData.filteredAbilities()?.length || 0)

        if (count === lastCount) {
            return
        }
        setFilteredData({...filteredData, guilds: newFilteredData.guilds})
        doFilter(creatorDataContext, reinc, count)

    }
}

export const GuildSkillFilter = (filteredData: FilteredData, creatorDataContext: CreatorDataContextType, reinc: ReincContextType): CreatorDataFilterType => {
    const {creatorData} = creatorDataContext
    return {
        doFilter: (): { skills: Ability[], spells: Ability[] } => {
            const guildAbilities: GuildAbility[] = []
            const guilds = reinc.guilds
            if (!guilds) {
                return {skills: reinc.skills, spells: reinc.spells}
            }
            guilds?.forEach((guild) => {
                const guildFileName = `guild_${guild.name.toLowerCase()}`.replaceAll(" ", "_")
                // @ts-ignore
                const g: Guild = creatorData[guildFileName]

                for (let i = guild.levels; i > 0; i--) {
                    const level = g.levels.get(i.toString())
                    level?.abilities.forEach((guildAbility: GuildAbility) => {
                        if (!guildAbilities.find((ga: GuildAbility) => ga.name === guildAbility.name)) {
                            guildAbilities.push(guildAbility)
                        }
                    })
                }
            })
            const newSkills = (filteredData.skills || reinc?.skills)?.filter((skill: Ability) => {
                return guildAbilities.find((ga) => ga.name === skill.name)
            }) || []
            const newSpells = (filteredData.spells || reinc?.spells)?.filter((spell: Ability) => {
                return guildAbilities.find((ga) => ga.name === spell.name)
            }) || []

            return {skills: newSkills, spells: newSpells}
        }
    }
}

export const AbilityGuildFilter = (filteredData: FilteredData, creatorDataContext: CreatorDataContextType, reinc: ReincContextType): CreatorDataFilterType => {
    const {originalCreatorData} = creatorDataContext

    return {
        doFilter: (): GuildLevels[] => {
            const guilds: Guild[] = []

            function addGuild(guild: Guild) {
                if (!guilds.find((g: Guild) => g.name === guild.name)) {
                    guilds.push(guild)
                }
            }

            function filterByAbility(ability: Ability) {
                reinc.getAllGuildsAndSubguilds().forEach((g) => {
                    for (let i = g.levels.size; i > 0; i--) {
                        const level = g.levels.get(i.toString())
                        level?.abilities.forEach((guildAbility: GuildAbility) => {
                            if (ability.name.trim() === guildAbility.name.trim() && ability.trained <= guildAbility.max) {
                                addGuild(g)
                            }
                        })
                    }
                })

            }

            const trainedSkills = reinc.skills.filter((s) => s.trained > 0)
            trainedSkills.forEach((ability) => {
                Object.entries(originalCreatorData).forEach(entry => {
                    if (entry[0].startsWith("guild_")) {
                        // @ts-ignore
                        filterByAbility(ability);

                    }
                })
            })

            const trainedSpells = reinc.spells.filter((s) => s.trained > 0)
            trainedSpells.forEach((ability) => {
                Object.entries(originalCreatorData).forEach(entry => {
                    if (entry[0].startsWith("guild_")) {
                        // @ts-ignore
                        filterByAbility(ability);
                    }
                })
            })

            const newGuilds: GuildLevels[] = guilds?.map((guild: Guild) => {
                return reinc.getGuildLevelsFromGuild(guild)
            })
            console.log("NEWGF", newGuilds)

            return newGuilds?.length === 0 ? creatorDataContext.originalCreatorData.guilds : newGuilds
        }
    }
}