import {ReincGuild, ReincType} from "@/app/contexts/reincContext";
import {Guild, GuildAbility} from "@/app/parsers/guildParser";
import {Ability} from "@/app/parsers/abilityCostParser";
import {CreatorDataType} from "@/app/parserFactory";
import {Dispatch} from "react";

export type CreatorDataFilterType = {
    doFilter: () => void
}

export const doFilter = (creatorData: CreatorDataType, setCreatorData: Dispatch<CreatorDataType>, reinc: ReincType | null) => {
    if (reinc) {
        console.log("filter")
        GuildSkillFilter(creatorData, setCreatorData, reinc).doFilter()
    }
}

export const GuildSkillFilter = (creatorData: CreatorDataType, setCreatorData: Dispatch<CreatorDataType>, reinc: ReincType): CreatorDataFilterType => {
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