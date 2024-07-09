import React, {
    Dispatch,
    PropsWithChildren,
    SetStateAction,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import {Ability} from '../parsers/abilityCostParser';
import {BaseStats, Race} from '../parsers/raceParser';
import {doFilter, onlyUnique} from "@/app/filters/creatorDataFilters";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import {GuildType} from "@/app/components/guilds";
import {FullGuild, GuildService, GuildServiceType} from "@/app/service/guildService";
import {Wish} from "@/app/data/wishes";

export const MAX_LEVEL = 120
export const MAX_STAT = 50


export type ReincStat = {
    id: number
    name: keyof BaseStats,
    trained: number
}
export type ReincType = {
    allGuilds: FullGuild[]
    filteredData: FilteredData
    race: Race | null | undefined;
    guilds: FullGuild[];
    skills: ReincAbility[];
    spells: ReincAbility[];
    skillMax: number;
    spellMax: number
    level: number
    stats: ReincStat[]
    wishes: Wish[]
};

export type TransientReincType = {};

export type ReincAbility = Ability

export type ReincFunctionsType = {
    updateAbility: (type: 'skills' | 'spells', ability: Ability) => Ability
    addOrUpdateGuild: (guildType: GuildType, guild: FullGuild, levels: number) => void
    getAbility: (ability: Partial<Ability>) => Ability | undefined
    setSkills: Dispatch<SetStateAction<Ability[]>>
    setSpells: Dispatch<SetStateAction<Ability[]>>
    setRace: Dispatch<SetStateAction<Race | null>>
    setFilteredData: Dispatch<SetStateAction<FilteredData>>
    getReincGuildByName: (name: string) => FullGuild | undefined
    setAllGuilds: Dispatch<SetStateAction<FullGuild[]>>
    guildService: GuildServiceType
    setStats: Dispatch<SetStateAction<ReincStat[]>>
    setWishes: Dispatch<SetStateAction<Wish[]>>
};

export type FilteredData = {
    guilds?: FullGuild [] | undefined
    skills?: Ability[] | undefined
    spells?: Ability[] | undefined
    filteredAbilities?: () => Ability[] | undefined
    filterCount: number
}
const defaultFilteredData: FilteredData = {
    filterCount: 0
}

export type ReincContextType = ReincType & ReincFunctionsType & TransientReincType
export const defaultReincContext: ReincType = {
    filteredData: defaultFilteredData,
    guilds: [],
    allGuilds: [],
    skills: [],
    spells: [],
    race: null,
    skillMax: 100,
    spellMax: 100,
    level: 0,
    stats: [
        {id: 1, name: "str", trained: 0},
        {id: 2, name: "dex", trained: 0},
        {id: 3, name: "con", trained: 0},
        {id: 4, name: "int", trained: 0},
        {id: 5, name: "wis", trained: 0},
        {id: 6, name: "cha", trained: 0},
    ],
    wishes: []
};
export const ReincContext = React.createContext<ReincType>(defaultReincContext)

export const ReincContextProvider = (props: PropsWithChildren<{}>) => {
    const ctx = useContext(ReincContext)
    const creatorDataContext = useCreatorData()
    const {creatorData} = creatorDataContext
    const [level, setLevel] = useState<number>(0)
    const [freeLevels, setFreeLevels] = useState<number>(0)
    const [race, setRace] = useState<Race | null>(null)
    const [skills, setSkills] = useState<Ability[]>([...creatorData.skills.filter(onlyUnique)])
    const [spells, setSpells] = useState<Ability[]>([...creatorData.spells.filter(onlyUnique)])
    const [allGuilds, setAllGuilds] = useState<FullGuild[]>([])
    const [guilds, setGuilds] = useState<FullGuild[]>([])
    const [stats, setStats] = useState<ReincStat[]>(defaultReincContext.stats)
    const [wishes, setWishes] = useState<Wish[]>([])

    const [filteredData, setFilteredData] = useState<FilteredData>({
        ...defaultFilteredData,
        skills: skills,
        spells: spells,
    })

    const [skillMax, setSkillMax] = useState(race?.skill_max || 100)
    const [spellMax, setSpellMax] = useState(race?.skill_max || 100)
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
        level,
        allGuilds,
        stats,
        wishes
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

    const getTrainedAbilities = (): Ability[] | undefined => {
        return skills.filter((s) => s.trained > 0)?.concat(spells.filter((s) => s.trained > 0))
    }


    const addOrUpdateAbility = (type: 'skills' | 'spells', ability: Ability) => {
        const updatedRow: ReincAbility = {...ability};
        if (type === "skills") {
            if (updatedRow.trained === skillMax) {
                updatedRow.maxed = true
            }
            setSkills(skills.map((skill) => (skill.name === ability.name ? updatedRow : skill)))
        } else {
            if (updatedRow.trained === spellMax) {
                updatedRow.maxed = true
            }
            setSpells(spells.map((spell) => (spell.name === ability.name ? updatedRow : spell)))
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
        console.debug("UPDATING GUILD:", guild, trained)
        if (guildType === 'main') {
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
                const updatedGuild = {...guilds[idx], trained: trained}
                if (trained === 0) {
                    updatedGuild.subGuilds.forEach((sg) => {
                        sg.trained = 0
                    })
                }
                console.debug("UPDATED GUILD:", updatedGuild)
                setGuilds([...guilds.filter((g) => g.name !== guild.name), updatedGuild])
            }
        } else {
            const otherGuilds = guilds.filter((g) => g.name.toLowerCase() !== guild.mainGuild?.name.toLowerCase())
            const main = guilds.find((g) => g.name === guild.mainGuild?.name)
            if (main) {
                const sub = main.subGuilds.find((sg) => {
                    return sg.name === guild.name
                })
                if (sub) {
                    console.log("UPDATING SUBGUILD", sub)
                    sub.trained = trained

                    const otherSubs = main.subGuilds.filter((sg) => {
                        return sg.name !== guild.name
                    })

                    setGuilds([...otherGuilds, {...main, subGuilds: [sub, ...otherSubs]}])
                }
            }
        }
    }


    let transientContex = {}
    const guildService = GuildService(creatorDataContext, values as ReincContextType)

    const reincFunctions: ReincFunctionsType = {
        updateAbility: addOrUpdateAbility,
        getAbility,
        getReincGuildByName,
        addOrUpdateGuild,
        setSkills,
        setSpells,
        setRace,
        setFilteredData,
        setAllGuilds,
        setStats,
        guildService,
        setWishes
    }

    let context = {...values, ...reincFunctions, ...transientContex,}
    context = {
        ...values, ...reincFunctions, ...transientContex,
        guildService: GuildService(creatorDataContext, context as ReincContextType)
    }

    transientContex = {...transientContex}

    const filterData = () => {
        doFilter(creatorDataContext, context as ReincContextType)
    }

    useEffect(() => {
        const guildService = GuildService(creatorDataContext, context as ReincContextType)
        setLevel(guildService.totalTrainedLevels() + freeLevels)
        const untrainedGuilds = guilds.filter((g) => {
            return g.trained === 0
        })

        console.debug("GUILDS", guilds)
        if (untrainedGuilds.length > 0) {
            setGuilds(guilds.filter((g) => {
                return g.trained > 0
            }))
        }
        filterData()

    }, [skills, spells, guilds]);

    useEffect(() => {
        const guildService = GuildService(creatorDataContext, context as ReincContextType)
        setLevel(guildService.totalTrainedLevels() + freeLevels)
        const untrainedGuilds = guilds.filter((g) => {
            return g.trained === 0
        })

        console.debug("GUILDS", guilds)
        if (untrainedGuilds.length > 0) {
            setGuilds(guilds.filter((g) => {
                return g.trained > 0
            }))
        }

        filterData()

    }, [guilds]);

    useEffect(() => {
        const guildService = GuildService(creatorDataContext, context as ReincContextType)

        const overTrainedSkills = skills.filter((s) => {
            return s.trained > 0
        }).map((s) => {
            const newMax = guildService.maxForGuilds(s, guilds)
            return {...s, trained: Math.min(newMax || 0, s.trained), max: newMax}
        })
        console.debug("OVERTRAINED SKILLS", overTrainedSkills)
        setSkills([...skills.filter((s) => overTrainedSkills.find((s1) => s1.name !== s.name)), ...overTrainedSkills])

        const overTrainedSpells = spells.filter((s) => {
            return s.trained > 0
        }).map((s) => {
            const newMax = guildService.maxForGuilds(s, guilds)
            return {...s, trained: Math.min(newMax || 0, s.trained), max: newMax}
        })
        setSpells([...spells.filter((s) => overTrainedSpells.find((s1) => s1.name !== s.name)), ...overTrainedSpells])

        filterData()
    }, [level]);

    useMemo(() => {
        const guildService = GuildService(creatorDataContext, context as ReincContextType)
        setLevel(guildService.totalTrainedLevels() + freeLevels)
        filterData()

    }, [skills, spells, guilds]);

    useEffect(() => {
        if (race) {
            console.log("SETTING MAXES", skillMax, spellMax)
            setSkillMax(race?.skill_max || 100)
            setSpellMax(race?.spell_max || 100)
        }
    }, [race, skillMax, spellMax])

    return (
        <ReincContext.Provider value={{...context, ...transientContex}}>
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