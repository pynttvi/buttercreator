import React, {PropsWithChildren, useContext, useEffect} from 'react';
import {Ability} from '../parsers/abilityCostParser';
import {Guild} from '../parsers/guildParser';
import {Race} from '../parsers/raceParser';
import {doFilter} from "@/app/filters/creatorDataFilters";
import {useCreatorData} from "@/app/contexts/creatorDataContext";


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
    addOrUpdateGuild: (guild: Guild, levels: number) => void
    getAbility: (ability: Partial<Ability>) => Ability | undefined
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
    const {creatorData, setCreatorData} = useCreatorData()

    const values: ReincType = {
        ...defaultReincContext,
        ...ctx,
    }

    const reincFunctions: ReincFunctionsType = {
        addOrUpdateAbility: (ability: Ability) => {
            const targetArray: Ability[] = ability.type === "skill" ? ctx.skills : ctx.spells
            const abilityIndex = targetArray.findIndex((a) => a.name === ability.name)
            if (abilityIndex !== -1) {
                targetArray[abilityIndex] = ability
            } else {
                targetArray.push(ability)
            }
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
        addOrUpdateGuild: (guild: Guild, levels: number) => {
            const idx = ctx.guilds.findIndex((g) => g.name === guild.name)
            const reincGuild = {name: guild.name, levels: levels}
            if (idx === -1) {
                ctx.guilds.push(reincGuild)
            } else {
                ctx.guilds[idx] = reincGuild
            }
            console.log("add guild")
            doFilter(creatorData, setCreatorData, ctx)
        }
    }

    return (
        <ReincContext.Provider value={{...values, ...reincFunctions}}>
            {props.children}
        </ReincContext.Provider>
    )
}

export const useReinc = (): ReincType => {
    const ctx = useContext(ReincContext)
    if(!ctx){
        throw new Error("Reinc context configuration error")
    }
    return ctx
}