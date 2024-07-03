import React, {PropsWithChildren, useContext, useEffect} from 'react';
import {Ability} from '../parsers/abilityCostParser';
import {Guild, GuildLevel} from '../parsers/guildParser';
import {Race} from '../parsers/raceParser';
import {doFilter} from "@/app/filters/creatorDataFilters";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import {GuildLevels} from "@/app/parsers/guildsFileParser";


export type ReincGuild = {
    name: string,
    levels: number
}
export type ReincType = {
    race: Race | null | undefined;
    guilds: ReincGuild[];
    skills: Ability[];
    spells: Ability[];
};

export type ReincFunctionsType = {
    addOrUpdateAbility: (ability: Ability) => void
    addOrUpdateGuild: (guild: GuildLevels, levels: number) => void
    getAbility: (ability: Partial<Ability>) => Ability | undefined
    getReincGuildByGuildLevels: (guild: Partial<GuildLevels>) => ReincGuild | undefined
    getGuildByGuildLevels: (guild: Partial<GuildLevels>) => Guild | undefined
    getSubguildsFromGuild: (guild: Guild) => GuildLevels[]
    getSubguildsByGuildName: (name: string) => GuildLevels[]
};
export const defaultReincContext: ReincType = {
    guilds: [],
    skills: [],
    spells: [],
    race: null
};
export const ReincContext = React.createContext<ReincType>(defaultReincContext)

export const ReincContextProvider = (props: PropsWithChildren<{}>) => {
    const ctx = useContext(ReincContext)
    const creatorDataContext = useCreatorData()
    const values: ReincType = {
        ...defaultReincContext,
        ...ctx,
    }

    const getGuildByGuildLevels = (guild: Partial<GuildLevels>): Guild | undefined => {
        // @ts-ignore
        return creatorDataContext.originalCreatorData[`guild_${guild.name?.toLowerCase()}`]
    }
    const getSubguildsFromGuild = (guild: Guild | undefined): GuildLevels[] => {
        const subGuilds: GuildLevels[] = []
        if (guild) {
            Object.entries(guild.subguilds).forEach((entry) => {
                subGuilds.push(entry[1])// @ts-ignore
            })
        }
        return subGuilds
    }

    const getSubguildsByGuildName = (name: string): GuildLevels[] => {
        return getSubguildsFromGuild(getGuildByGuildLevels({name}))
    }
    const reincFunctions: ReincFunctionsType = {
        addOrUpdateAbility: (ability: Ability) => {
            console.log("Update ability")
            const targetArray: Ability[] = ability.type === "skill" ? ctx.skills : ctx.spells
            const abilityIndex = targetArray.findIndex((a) => a.name === ability.name)
            if (abilityIndex !== -1) {
                targetArray[abilityIndex] = ability
            } else {
                if (ability.trained > 0) {
                    targetArray.push(ability)
                }
            }
            doFilter(creatorDataContext, ctx)

        },
        getAbility: (ability: Partial<Ability>) => {
            if (ability.type) {
                return ability.type === "skill" ? ctx.skills.find((a) => a.name === ability.name) : ctx.spells.find((a) => a.name === ability.name)
            } else {
                let ability: Ability | undefined = ctx.skills.find((a) => a.name === ability?.name)
                if (!ability) {
                    ability = ctx.skills.find((a) => a.name === ability?.name)
                }
                return ability
            }
        },
        getReincGuildByGuildLevels: (guild: Partial<ReincGuild>) => {
            return ctx.guilds.find((rg) => {
                return rg.name === guild.name
            })
        },
        addOrUpdateGuild: (guild: GuildLevels, levels: number) => {
            const idx = ctx.guilds.findIndex((g) => g.name.toLowerCase() === guild.name.toLowerCase())
            const reincGuild = {name: guild.name.toLowerCase(), levels: levels}
            if (idx === -1) {
                ctx.guilds.push(reincGuild)
            } else {
                ctx.guilds[idx] = reincGuild
            }
            console.log("add guild")
            doFilter(creatorDataContext, ctx)
        },
        getGuildByGuildLevels,
        getSubguildsFromGuild,
        getSubguildsByGuildName

    }

    return (
        <ReincContext.Provider value={{...values, ...reincFunctions}}>
            {props.children}
        </ReincContext.Provider>
    )
}

export const useReinc = (): ReincType & ReincFunctionsType => {
    const ctx: ReincType & ReincFunctionsType = useContext(ReincContext) as ReincType & ReincFunctionsType
    if (!ctx) {
        throw new Error("Reinc context configuration error")
    }
    return ctx
}