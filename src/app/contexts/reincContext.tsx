import React, {PropsWithChildren, useContext} from 'react';
import {Ability} from '../parsers/abilityCostParser';
import {Guild} from '../parsers/guildParser';
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
    getAllGuildsAndSubguilds: () => Guild[]
};

export type ReincContextType = ReincType & ReincFunctionsType
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

    const addOrUpdateAbility = (ability: Ability) => {
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
        filterData()
    }

    const getReincGuildByGuildLevels = (guild: Partial<ReincGuild>) => {
        return ctx.guilds.find((rg) => {
            return rg.name === guild.name
        })
    }
    const getAbility = (ability: Partial<Ability>) => {
        if (ability.type) {
            return ability.type === "skill" ? ctx.skills.find((a) => a.name === ability.name) : ctx.spells.find((a) => a.name === ability.name)
        } else {
            let ability: Ability | undefined = ctx.skills.find((a) => a.name === ability?.name)
            if (!ability) {
                ability = ctx.skills.find((a) => a.name === ability?.name)
            }
            return ability
        }
    }

    const addOrUpdateGuild = (guild: GuildLevels, levels: number) => {
        const idx = ctx.guilds.findIndex((g) => g.name.toLowerCase() === guild.name.toLowerCase())
        const reincGuild = {name: guild.name.toLowerCase(), levels: levels}
        if (idx === -1) {
            ctx.guilds.push(reincGuild)
        } else {
            ctx.guilds[idx] = reincGuild
        }
        console.log("add guild")
        filterData()
    }

    const getAllGuildsAndSubguilds = () => {
        const dataGuilds: Guild[] = []

        function addDataGuild(guild: Guild) {
            if (!dataGuilds.find((g: Guild) => g.name === guild.name)) {
                dataGuilds.push(guild)
            }
        }

        Object.entries(creatorDataContext.originalCreatorData).forEach((entry) => {
            if (entry[0].startsWith("guild_")) {
                const guild: Guild = entry[1] as Guild
                dataGuilds.push(guild)
                dataGuilds.forEach((g: Guild) => {

                    getSubguildsByGuildName(g.name).forEach((sg) => {
                        const subguild = getGuildByGuildLevels(sg)

                        if (subguild) {
                            addDataGuild(subguild)
                        }
                        subguild?.subguilds.forEach((sg1) => {
                            const subguild1 = getGuildByGuildLevels(sg1)
                            if (subguild1 && sg1.name !== sg.name) {
                                addDataGuild(subguild1)
                            }
                        })
                    })
                })
            }
        })
        return dataGuilds
    }

    const reincFunctions: ReincFunctionsType = {
        addOrUpdateAbility,
        getAbility,
        getReincGuildByGuildLevels,
        addOrUpdateGuild,
        getGuildByGuildLevels,
        getSubguildsFromGuild,
        getSubguildsByGuildName,
        getAllGuildsAndSubguilds
    }

    const context = {...values, ...reincFunctions}
    const filterData = () => {
        doFilter(creatorDataContext, context as ReincContextType)
    }
    return (
        <ReincContext.Provider value={context}>
            {props.children}
        </ReincContext.Provider>
    )
}

export const useReinc = (): ReincContextType => {
    const ctx: ReincContextType = useContext(ReincContext) as ReincContextType
    if (!ctx) {
        throw new Error("Reinc context configuration error")
    }
    return ctx
}