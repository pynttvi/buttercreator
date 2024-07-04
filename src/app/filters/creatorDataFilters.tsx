import {ReincContextType} from "@/app/contexts/reincContext";
import {Guild, GuildAbility} from "@/app/parsers/guildParser";
import {Ability} from "@/app/parsers/abilityCostParser";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {GuildLevels} from "@/app/parsers/guildsFileParser";

export type CreatorDataFilterType = {
    doFilter: () => void
}

export const doFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincContextType | null) => {
    if (reinc) {
        GuildSkillFilter(creatorDataContext, reinc).doFilter()
        AbilityGuildFilter(creatorDataContext, reinc).doFilter()
    }
}

export const GuildSkillFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincContextType): CreatorDataFilterType => {
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

export const AbilityGuildFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincContextType): CreatorDataFilterType => {
    const {setCreatorData, originalCreatorData} = creatorDataContext

    return {
        doFilter: (): void => {
            const guilds: Guild[] = []


            function addGuild(guild: Guild) {
                if (!guilds.find((g: Guild) => g.name === guild.name)) {
                    guilds.push(guild)
                }
            }

            function filterByAbility(entry: [string, Guild], ability: Ability) {

                reinc.getAllGuildsAndSubguilds().forEach((g) => {
                    for (let i = g.levels.size; i > 0; i--) {
                        const level = g.levels.get(i.toString())
                        level?.abilities.forEach((guildAbility: GuildAbility) => {
                            if(guildAbility.name === "advanced martial arts"){
                                console.log("NAME", ability.name, guildAbility.name)
                                console.log("Ability", ability.trained, guildAbility.max)
                            }
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

            const newGuilds = originalCreatorData?.guilds?.filter((guild: GuildLevels) => {
                return guilds.find((g) => g.name.toLowerCase() === guild.name.toLowerCase())
            }) || []

            setCreatorData({
                ...originalCreatorData,
                guilds: newGuilds.length === 0 && trainedSkills.length === 0 && trainedSpells.length === 0 ? originalCreatorData.guilds : newGuilds
            })
        }
    }
}