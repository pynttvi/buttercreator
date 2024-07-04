import React, {Dispatch, PropsWithChildren, SetStateAction, useContext, useEffect, useState} from 'react';
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
    updateAbility: (type: 'skills' | 'spells', ability: Ability) => Ability
    addOrUpdateGuild: (guild: GuildLevels, levels: number) => void
    getAbility: (ability: Partial<Ability>) => Ability | undefined
    getReincGuildByGuildLevels: (guild: Partial<GuildLevels>) => ReincGuild | undefined
    getGuildByGuildLevels: (guild: Partial<GuildLevels>) => Guild | undefined
    getSubguildsFromGuild: (guild: Guild) => GuildLevels[]
    getSubguildsByGuildName: (name: string) => GuildLevels[]
    getAllGuildsAndSubguilds: () => Guild[]
    setSkills: Dispatch<SetStateAction<Ability[]>>
    setSpells: Dispatch<SetStateAction<Ability[]>>
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
    const {creatorData} = creatorDataContext
    const [skills, setSkills] = useState<Ability[]>([...creatorData.skills])
    const [spells, setSpells] = useState<Ability[]>([...creatorData.spells])
    const values: ReincType = {
        ...defaultReincContext,
        ...ctx,
        skills,
        spells
    }

    if (values.skills.length === 0) {
        values.skills.push(...creatorData.skills)
    }
    if (values.spells.length === 0) {
        values.spells.push(...creatorData.spells)
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

    const addOrUpdateAbility = (type: 'skills' | 'spells', ability: Ability) => {
        const updatedRow = {...ability};
        if (type === "skills") {
            setSkills(skills.map((skill) => (skill.id === ability.id ? updatedRow : skill)))
        } else {
            setSpells(spells.map((spell) => (spell.id === ability.id ? updatedRow : spell)))
        }
        return updatedRow;
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
            let a: Ability | undefined = ctx.skills.find((a) => a.name === ability.name)
            if (!a) {
                a = ctx.skills.find((a) => a.name === ability?.name)
            }
            return a
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
        updateAbility: addOrUpdateAbility,
        getAbility,
        getReincGuildByGuildLevels,
        addOrUpdateGuild,
        getGuildByGuildLevels,
        getSubguildsFromGuild,
        getSubguildsByGuildName,
        getAllGuildsAndSubguilds,
        setSkills,
        setSpells,
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