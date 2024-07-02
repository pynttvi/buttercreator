import React, { PropsWithChildren, useContext } from 'react';
import { Ability } from '../parsers/abilityCostParser';
import { Guild } from '../parsers/guildParser';
import { Race } from '../parsers/raceParser';
import HelpSpellsParser from '../parsers/helpSpellsParser';


export type ReincType = {
    race: Race | null;
    guilds: Guild[];
    skills: Ability[];
    spells: Ability[];
    addOrUpdateAbility: (ability: Ability) => void
};
export const defaultReincContext: Partial<ReincType> = {
    race: null,
    guilds: [],
    skills: [],
    spells: [],
};

export const ReincContext = React.createContext<ReincType>(defaultReincContext as ReincType)

export const ReincContextProvider = (props: PropsWithChildren) => {
    const ctx = React.useContext(ReincContext)

    const reincFunctions: Partial<ReincType> = {
        addOrUpdateAbility: (ability: Ability) => {
            const targetArray: Ability[] = ability.type === "skill" ? ctx.skills : ctx.spells
            const abilityIndex = targetArray.findIndex((a) => a.name === ability.name)
            if (abilityIndex !== -1) {
                targetArray[abilityIndex] = ability
            } else {
                targetArray.push(ability)
            }
        }
    }

    return (
        <ReincContext.Provider value={{ ...defaultReincContext, ...reincFunctions } as ReincType}>
            {props.children}
        </ReincContext.Provider>
    )
}

export const useReinc = (): ReincType => {
    return useContext(ReincContext)
}