import React, {Dispatch, PropsWithChildren, SetStateAction, useContext, useEffect, useState} from 'react';
import {Ability} from '../parsers/abilityCostParser';
import {Race} from '../parsers/raceParser';
import {doFilter, onlyUnique} from "@/app/filters/creatorDataFilters";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import {GuildType} from "@/app/components/guilds";
import {FullGuild, GuildService, GuildServiceType} from "@/app/service/guildService";

export const MAX_LEVEL = 120

export type ReincType = {
    filteredData: FilteredData
    race: Race | null | undefined;
    guilds: FullGuild[];
    skills: ReincAbility[];
    spells: ReincAbility[];
    skillMax: number;
    spellMax: number
};

export type TransientReincType = {
    level: number
};

export type ReincAbility = Ability & { max?: boolean }

export type ReincFunctionsType = {
    updateAbility: (type: 'skills' | 'spells', ability: Ability) => Ability
    addOrUpdateGuild: (guildType: GuildType, guild: FullGuild, levels: number) => void
    getAbility: (ability: Partial<Ability>) => Ability | undefined
    setSkills: Dispatch<SetStateAction<Ability[]>>
    setSpells: Dispatch<SetStateAction<Ability[]>>
    setRace: Dispatch<SetStateAction<Race | null>>
    setFilteredData: Dispatch<SetStateAction<FilteredData>>
    guildService: GuildServiceType
    getReincGuildByName: (name: string) => FullGuild | undefined
};

export type FilteredData = {
    guilds?: FullGuild [] | undefined
    skills?: Ability[] | undefined
    spells?: Ability[] | undefined
    filteredAbilities?: () => Ability[] | undefined
}
const defaultFilteredData: FilteredData = {}

export type ReincContextType = ReincType & ReincFunctionsType & TransientReincType
export const defaultReincContext: ReincType = {
    filteredData: defaultFilteredData,
    guilds: [],
    skills: [],
    spells: [],
    race: null,
    skillMax: 100,
    spellMax: 100,
};
export const ReincContext = React.createContext<ReincType>(defaultReincContext)

export const ReincContextProvider = (props: PropsWithChildren<{}>) => {
    const ctx = useContext(ReincContext)
    const creatorDataContext = useCreatorData()
    const {creatorData} = creatorDataContext
    const [freeLevels, setFreeLevels] = useState<number>(0)
    const [race, setRace] = useState<Race | null>(null)
    const [skills, setSkills] = useState<Ability[]>([...creatorData.skills.filter(onlyUnique)])
    const [spells, setSpells] = useState<Ability[]>([...creatorData.spells.filter(onlyUnique)])
    const [guilds, setGuilds] = useState<FullGuild[]>([])
    const [filteredData, setFilteredData] = useState<FilteredData>({
        ...defaultFilteredData,

    })
    const skillMax = race?.skill_max || 100
    const spellMax = race?.skill_max || 100
    const values: ReincType = {
        ...defaultReincContext,
        ...ctx,
        guilds,
        filteredData,
        skills,
        spells,
        race,
        skillMax,
        spellMax,
    }

    if (values.skills.length === 0) {
        values.skills.push(...creatorData.skills.filter(onlyUnique))
    }
    if (values.spells.length === 0) {
        values.spells.push(...creatorData.spells)
    }

    const getDefaultFilters = () => {
        return {
            guilds: creatorData.guilds,
            skills: creatorData.skills,
            spells: creatorData.spells,
            filteredAbilities: (): Ability[] | undefined => {
                return filteredData.skills?.concat(filteredData?.spells || [])
            }
        }
    }
    useEffect(() => {
        filterData()
    }, [skills]);

    // useEffect(() => {
    //     if (guildLevels === 0 && getTrainedAbilities()?.length === 0) {
    //         //  setFilteredData(getDefaultFilters)
    //     }
    // }, [guildLevels]);

    const getTrainedAbilities = (): Ability[] | undefined => {
        return skills.filter((s) => s.trained > 0)?.concat(spells.filter((s) => s.trained > 0))
    }


    const addOrUpdateAbility = (type: 'skills' | 'spells', ability: Ability) => {
        const updatedRow: ReincAbility = {...ability};
        if (type === "skills") {
            if (updatedRow.trained === skillMax) {
                updatedRow.max = true
            }
            setSkills(skills.map((skill) => (skill.id === ability.id ? updatedRow : skill)))
        } else {
            if (updatedRow.trained === spellMax) {
                updatedRow.max = true
            }
            setSpells(spells.map((spell) => (spell.id === ability.id ? updatedRow : spell)))
        }
        return updatedRow;
    }

    const getReincGuildByName = (name: string): FullGuild | undefined => {
        return guilds.find((rg) => {
            return rg.name === name
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

    const addOrUpdateGuild = (guildType: GuildType, guild: FullGuild, trained: number) => {
        const idx = guilds.findIndex((g) => g.name.toLowerCase() === guild.name.toLowerCase())
        if (idx === -1) {
            const newGuild: FullGuild = {
                ...guild,
                guildType: guildType,
                trained: trained,
                name: guild.name.toLowerCase().replaceAll("_", " ")
            }
            setGuilds([...guilds, newGuild])
        } else {
            setGuilds([...guilds.filter((g) => g.name !== guild.name), {...guilds[idx], trained: trained}])
        }
        console.log("EDIT guilds", guilds)
    }


    const guildService = GuildService(creatorDataContext, values as ReincContextType)
    const transientContex = {
            level: guildService.totalTrainedLevels() + freeLevels,
        }

    const reincFunctions: ReincFunctionsType = {
        updateAbility: addOrUpdateAbility,
        getAbility,
        getReincGuildByName,
        addOrUpdateGuild,
        setSkills,
        setSpells,
        setRace,
        setFilteredData,
        guildService,
    }

    const level = 0
    const context = {...values, ...reincFunctions, ...transientContex}
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