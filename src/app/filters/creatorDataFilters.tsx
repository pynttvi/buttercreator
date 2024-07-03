import {ReincType} from "@/app/contexts/reincContext";
import {Guild, GuildAbility} from "@/app/parsers/guildParser";
import {Ability} from "@/app/parsers/abilityCostParser";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";

export type CreatorDataFilterType = {
    doFilter: () => void
}

export const doFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincType | null) => {
    if (reinc) {
        console.log("filter")
        GuildSkillFilter(creatorDataContext, reinc).doFilter()
        AbilityGuildFilter(creatorDataContext, reinc).doFilter()
    }
}

export const GuildSkillFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincType): CreatorDataFilterType => {
    const {creatorData, setCreatorData} = creatorDataContext
    return {
        doFilter: (): void => {
            const guildAbilities: GuildAbility[] = []
            reinc.guilds.forEach((guild) => {
                // @ts-ignore
                const g: Guild = creatorData[`guild_${guild.name.toLowerCase()}`]
                for (let i = guild.levels; i > 0; i--) {
                    const level = g.levels.get(i.toString())
                    level?.abilities.forEach((guildAbility: GuildAbility) => {
                        if (!guildAbilities.find((ga: GuildAbility) => ga.name === guildAbility.name)) {
                            guildAbilities.push(guildAbility)
                        }
                    })
                }
            })
            const newSkills = creatorData?.skills?.filter((skill: Ability) => {
                return guildAbilities.find((ga) => ga.name === skill.name)
            }) || []
            const newSpells = creatorData?.spells?.filter((spell: Ability) => {
                return guildAbilities.find((ga) => ga.name === spell.name)
            }) || []

            setCreatorData({...creatorData, skills: newSkills, spells: newSpells})
        }
    }
}

export const AbilityGuildFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincType): CreatorDataFilterType => {
    const {setCreatorData, originalCreatorData} = creatorDataContext

    return {
        doFilter: (): void => {
            const guilds: Guild[] = []

            function filterByAbility(entry: [string, Guild], ability: Ability) {
                const g: Guild = entry[1] as Guild
                for (let i = g.levels.size; i > 0; i--) {
                    const level = g.levels.get(i.toString())
                    level?.abilities.forEach((guildAbility: GuildAbility) => {
                        if (ability.name === guildAbility.name && ability.trained <= guildAbility.max) {
                            if (!guilds.find((guild: Guild) => guild.name === g.name)) {
                                guilds.push(g)
                            }
                        }
                    })
                }
            }

            const trainedSkills = reinc.skills.filter((s) => s.trained > 0)
            trainedSkills.forEach((ability) => {
                Object.entries(originalCreatorData).forEach(entry => {
                    if (entry[0].startsWith("guild_")) {
                        // @ts-ignore
                        filterByAbility(entry, ability);
                    }
                })
            })

            const trainedSpells = reinc.spells.filter((s) => s.trained > 0)
            trainedSpells.forEach((ability) => {
                Object.entries(originalCreatorData).forEach(entry => {
                    if (entry[0].startsWith("guild_")) {
                        // @ts-ignore
                        filterByAbility(entry, ability);
                    }
                })
            })

            const newGuilds = originalCreatorData?.guilds?.filter((guild: Guild) => {
                return guilds.find((g) => g.name.toLowerCase() === guild.name.toLowerCase())
            }) || []

            setCreatorData({
                ...originalCreatorData,
                guilds: newGuilds.length === 0 && trainedSkills.length === 0 && trainedSpells.length === 0 ? originalCreatorData.guilds : newGuilds
            })
        }
    }
}