import React, {Dispatch, PropsWithChildren, ReactNode, SetStateAction, useContext, useEffect, useState} from 'react';
import {Ability} from '../parsers/abilityCostParser';
import {BaseStatName, baseStats, BaseStats, Race} from '../parsers/raceParser';
import {doFilter, FilterDataType} from "@/app/filters/creatorDataFilters";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {FullGuild, GuildServiceType, GuildUtils} from "@/app/utils/guildUtils";
import WishHandler, {Wish} from "@/app/data/wishHandler";
import {GuildAbility} from "@/app/parsers/guildParser";

export const MAX_LEVEL = 120
export const MAX_STAT = 50


export type ReincAbility = Ability & GuildAbility

export type ReincStat = {
    id: number
    name: keyof BaseStats,
    trained: number
}

export type BonusBaseStat = { name: BaseStatName, percent: number }
export type ReincType = {
    ready: boolean
    allGuilds: FullGuild[]
    allSpells: ReincAbility[];
    allSkills: ReincAbility[];
    race: Race | null | undefined;
    guilds: FullGuild[];
    skills: ReincAbility[];
    spells: ReincAbility[];
    skillMax: number;
    customSkillMaxBonus: number;
    spellMax: number
    customSpellMaxBonus: number
    level: number
    freeLevels: number
    stats: ReincStat[]
    bonusBaseStats: BonusBaseStat[]
    wishes: Wish[]
    filteredData: FilterDataType
    copyPasteSeparator: string
    helpText: string | ReactNode
    drawerOpen: boolean
};

export type TransientReincType = {
    filterData?: () => void
};

export type ReincFunctionsType = {
    setAllSkills: Dispatch<SetStateAction<ReincAbility[]>>
    setAllSpells: Dispatch<SetStateAction<ReincAbility[]>>
    setSkills: Dispatch<SetStateAction<ReincAbility[]>>
    setSpells: Dispatch<SetStateAction<ReincAbility[]>>
    setRace: Dispatch<SetStateAction<Race | null>>
    setAllGuilds: Dispatch<SetStateAction<FullGuild[]>>
    setGuilds: Dispatch<SetStateAction<FullGuild[]>>
    guildUtils: GuildServiceType
    setStats: Dispatch<SetStateAction<ReincStat[]>>
    setBonusBaseStats: Dispatch<SetStateAction<BonusBaseStat[]>>
    setWishes: Dispatch<SetStateAction<Wish[]>>
    setSkillMax: Dispatch<SetStateAction<number>>
    setSpellMax: Dispatch<SetStateAction<number>>
    setFreeLevels: Dispatch<SetStateAction<number>>
    setCustomSkillMaxBonus: Dispatch<SetStateAction<number>>
    setCustomSpellMaxBonus: Dispatch<SetStateAction<number>>
    setCopyPasteSeparator: Dispatch<SetStateAction<string>>
    setHelpText: Dispatch<SetStateAction<string | ReactNode>>
    setDrawerOpen: Dispatch<SetStateAction<boolean>>
};


export type ReincContextType = ReincType & ReincFunctionsType & TransientReincType
export const defaultReincContext: ReincType = {
    ready: false,
    guilds: [],
    allGuilds: [],
    allSkills: [],
    allSpells: [],
    skills: [],
    spells: [],
    race: null,
    skillMax: 100,
    spellMax: 100,
    customSkillMaxBonus: 0,
    customSpellMaxBonus: 0,
    level: 0,
    freeLevels: 0,
    stats: [
        ...baseStats.map((bs, idx) => ({id: idx, name: bs, trained: 0}))
    ],
    wishes: [],
    bonusBaseStats: [
        ...baseStats.map((bs) => ({name: bs, percent: 0}))
    ],
    filteredData: {
        skills: [],
        spells: [],
        guilds: [],
    },
    copyPasteSeparator: ";",
    helpText: "",
    drawerOpen: false
};
export const ReincContext = React.createContext<ReincContextType | null>(null)

export const FullReincContext = (creatorDataContext: CreatorDataContextType) => {
    const ctx = useContext(ReincContext)
    const [ready, setReady] = useState<boolean>(false)
    const [level, setLevel] = useState<number>(0)
    const [freeLevels, setFreeLevels] = useState<number>(0)
    const [race, setRace] = useState<Race | null>(null)
    const [skills, setSkills] = useState<ReincAbility[]>([])
    const [spells, setSpells] = useState<ReincAbility[]>([])
    const [allGuilds, setAllGuilds] = useState<FullGuild[]>([])
    const [allSkills, setAllSkills] = useState<ReincAbility[]>([])
    const [allSpells, setAllSpells] = useState<ReincAbility[]>([])
    const [guilds, setGuilds] = useState<FullGuild[]>([])
    const [stats, setStats] = useState<ReincStat[]>(defaultReincContext.stats)
    const [bonusBaseStats, setBonusBaseStats] = useState<BonusBaseStat[]>(defaultReincContext.bonusBaseStats)
    const [wishes, setWishes] = useState<Wish[]>([])

    const [skillMax, setSkillMax] = useState(race?.skill_max || 100)
    const [spellMax, setSpellMax] = useState(race?.skill_max || 100)
    const [customSkillMaxBonus, setCustomSkillMaxBonus] = useState(0)
    const [customSpellMaxBonus, setCustomSpellMaxBonus] = useState(0)
    const [copyPasteSeparator, setCopyPasteSeparator] = useState(";")
    const [helpText, setHelpText] = useState<string | ReactNode>("")
    const [drawerOpen, setDrawerOpen] = useState(false)

    const [filteredData, setFilteredData] = useState<FilterDataType>(defaultReincContext.filteredData)
    const values: ReincType = {
        ...defaultReincContext,
        ...ctx,
        guilds,
        skills,
        spells,
        race,
        skillMax,
        spellMax,
        level,
        freeLevels,
        allGuilds,
        stats,
        wishes,
        bonusBaseStats,
        filteredData,
        allSkills,
        allSpells,
        customSkillMaxBonus,
        customSpellMaxBonus,
        copyPasteSeparator,
        helpText,
        drawerOpen,
        ready
    }


    let transientContex: TransientReincType = {}
    const guildUtils = GuildUtils(creatorDataContext, values as ReincContextType)

    const reincFunctions: ReincFunctionsType = {
        setSkills,
        setSpells,
        setRace,
        setAllGuilds,
        setGuilds,
        setStats,
        guildUtils,
        setWishes,
        setBonusBaseStats,
        setSkillMax,
        setSpellMax,
        setAllSkills,
        setAllSpells,
        setFreeLevels,
        setCustomSkillMaxBonus,
        setCustomSpellMaxBonus,
        setCopyPasteSeparator,
        setHelpText,
        setDrawerOpen
    }

    let context = {...values, ...reincFunctions, ...transientContex,}
    context = {
        ...values, ...reincFunctions, ...transientContex,
        guildUtils: GuildUtils(creatorDataContext, context as ReincContextType)
    }

    transientContex = {...transientContex}

    const filterData = () => {
        setReady(false)
        const fd = doFilter(creatorDataContext, context as ReincContextType)
        console.debug("FILTERING DATA", fd?.spells)
        if (fd) setFilteredData({...fd})
        setReady(true)
    }

    transientContex = {...transientContex} as TransientReincType

    useEffect(() => {
        filterData()
    }, [race, skills, spells, level, wishes, skillMax, spellMax]);


    useEffect(() => {
        filterData()
    }, []);

    useEffect(() => {
        const guildService = GuildUtils(creatorDataContext, context as ReincContextType)
        setLevel(guildService.totalTrainedLevels() + freeLevels)

    }, [guilds]);


    useEffect(() => {
        const wishHandler = WishHandler(context)

        const knowledgeWishes = [...wishes.filter((w: Wish) => w.applied && w.name === "superior knowledge" || w.name === "better knowledge")] || []

        const skillMax = race?.skill_max ? race.skill_max : 100
        const spellMax = race?.spell_max ? race.spell_max : 100
        setSkillMax(skillMax)
        setSpellMax(spellMax)


        console.debug("SETTING MAXES", skillMax, spellMax)
        knowledgeWishes.forEach((w) => wishHandler.apply(w.name, true))


    }, [race, customSpellMaxBonus, customSkillMaxBonus])


    const wishHandler = WishHandler(context)
    useEffect(() => {
        wishes.filter((w) => !w.applied).forEach((w) => wishHandler.apply(w.name))
    }, [wishes]);
    //   console.log(guildUtils.getAllGuildsFlat().map(g => ({name: g.name, to: "", back: ""})))
    return {...context, ...transientContex, guildService: GuildUtils(creatorDataContext, context)}

}
export const ReincContextProvider = (props: PropsWithChildren<{
    creatorDataContext: CreatorDataContextType
}>) => {

    const context = FullReincContext(props.creatorDataContext)
    return (
        <ReincContext.Provider value={context}>
            {props.children}
        </ReincContext.Provider>
    )
}

export const useReinc = (): ReincContextType => {
    const ctx: ReincContextType = useContext(ReincContext) as ReincContextType
    if (!ctx) {
        throw new Error("Costs context configuration error")
    }
    return ctx
}