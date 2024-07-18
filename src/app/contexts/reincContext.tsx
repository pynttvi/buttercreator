import React, {
    Dispatch,
    PropsWithChildren,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import {Ability} from '../parsers/abilityCostParser';
import {BaseStatName, baseStats, BaseStats, Race} from '../parsers/raceParser';
import {doFilter, FilterDataType} from "@/app/filters/creatorDataFilters";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {GuildType} from "@/app/components/guilds";
import {FullGuild, GuildService, GuildServiceType} from "@/app/service/guildService";
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
    updateAbility: (type: 'skills' | 'spells', ability: ReincAbility | ReincAbility[]) => ReincAbility | ReincAbility[]
    addOrUpdateGuild: (guildType: GuildType, guild: FullGuild, levels: number) => void
    getAbility: (ability: Partial<ReincAbility>) => Ability | undefined
    setAllSkills: Dispatch<SetStateAction<ReincAbility[]>>
    setAllSpells: Dispatch<SetStateAction<ReincAbility[]>>
    setSkills: Dispatch<SetStateAction<ReincAbility[]>>
    setSpells: Dispatch<SetStateAction<ReincAbility[]>>
    setRace: Dispatch<SetStateAction<Race | null>>
    getReincGuildByName: (name: string) => FullGuild | undefined
    setAllGuilds: Dispatch<SetStateAction<FullGuild[]>>
    guildService: GuildServiceType
    setStats: Dispatch<SetStateAction<ReincStat[]>>
    setBonusBaseStats: Dispatch<SetStateAction<BonusBaseStat[]>>
    setWishes: Dispatch<SetStateAction<Wish[]>>
    setSkillMax: Dispatch<SetStateAction<number>>
    setSpellMax: Dispatch<SetStateAction<number>>
    setCustomSkillMaxBonus: Dispatch<SetStateAction<number>>
    setCustomSpellMaxBonus: Dispatch<SetStateAction<number>>
    setCopyPasteSeparator: Dispatch<SetStateAction<string>>
    setHelpText: Dispatch<SetStateAction<string | ReactNode>>
    setDrawerOpen: Dispatch<SetStateAction<boolean>>
};


export type ReincContextType = ReincType & ReincFunctionsType & TransientReincType
export const defaultReincContext: ReincType = {
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
    const {creatorData} = creatorDataContext
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
    }


    const getTrainedAbilities = (): Ability[] | undefined => {
        return skills.filter((s) => s.trained > 0)?.concat(spells.filter((s) => s.trained > 0))
    }


    const addOrUpdateAbility = (type: 'skills' | 'spells', ability: ReincAbility | ReincAbility[]) => {
        let targetArray: ReincAbility[] = []
        if (type === "skills") {
            targetArray = skills
        } else {
            targetArray = spells
        }
        let newAbilities: ReincAbility[] = []

        function getNewAbility(oldAbility: ReincAbility, newAbility: ReincAbility) {
            if (oldAbility.name === newAbility.name) {
                oldAbility.trained = newAbility.trained

                if (newAbility.trained === newAbility.max) {
                    oldAbility.maxed = true
                }
            }
            return oldAbility
        }

        let newA = ability

        if (ability instanceof Array) {
            newAbilities = targetArray.map((oldAbility) => {
                const newAbility = ability.find(a => a.name === oldAbility.name) as ReincAbility
                return getNewAbility(oldAbility, newAbility)
            })
        } else {
            newAbilities = targetArray.map((oldAbility) => {
                const newAbility = getNewAbility(oldAbility, ability)
                if (oldAbility.name === ability.name) {
                    newA = newAbility
                }
                return newAbility
            })
        }

        if (type === "skills") {
            setSkills([...newAbilities])
        } else {
            setSpells([...newAbilities])
        }
        console.debug("UPDATING ABILITY", ability, newA, newAbilities)
        if (ability instanceof Array) {
            return newAbilities;

        } else {
            return newA
        }
    }

    const getReincGuildByName = (name: string): FullGuild | undefined => {
        return guilds.find((rg) => {
            return rg.name === name
        })
    }
    const getAbility = (ability: Partial<ReincAbility>) => {
        if (ability.type) {
            return ability.type === "skill" ? skills.find((a) => a.name === ability.name) : spells.find((a) => a.name === ability.name)
        } else {
            let a: ReincAbility | undefined = skills.find((a) => a.name === ability.name)
            if (!a) {
                a = skills.find((a) => a.name === ability?.name)
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
                    console.debug("UPDATING SUBGUILD", sub)
                    sub.trained = trained

                    const otherSubs = main.subGuilds.filter((sg) => {
                        return sg.name !== guild.name
                    })

                    setGuilds([...otherGuilds, {...main, subGuilds: [sub, ...otherSubs]}])
                }
            }
        }

    }

    const initAbilities = (guilds: FullGuild[]) => {
        let gaIdx = 0

        let guildAbilities: ReincAbility[] = []

        function addAbilities(guild: FullGuild) {

            if (level > 0 && guild.trained === 0) {
                console.debug("RETURNING")
                return
            }

            console.debug("ADDING ABILITIS!", guild.name, guild)
            for (let i = guild.levels + 2; i > 0; i--) {

                const level = guild.levelMap.get(i.toString())

                level?.abilities.forEach((guildAbility: GuildAbility, idx) => {
                    const ra: ReincAbility = {
                        cost: 0,
                        enabled: true,
                        id: gaIdx,
                        maxed: false,
                        guild: guild,
                        trained: 0, ...guildAbility
                    }
                    guildAbilities.push(ra)
                })
            }
        }

        guilds?.forEach((guild) => {
            guild.subGuilds.forEach((sg => {
                addAbilities(sg)
            }))
            guild.subGuilds.forEach((sg => {
                sg.subGuilds.forEach((sg => {
                    addAbilities(sg)
                }))
            }))
            addAbilities(guild)

        })

        console.debug("Ability GUILDS", guilds)
        const guildSkills = guildAbilities.filter(ga => ga.type === 'skill')
        const guildSpells = guildAbilities.filter(ga => ga.type === 'spell')

        console.debug("GUILD ABILITIS", guildSkills, guildSpells)

        if (allSkills.length === 0 && allSpells.length === 0) {
            const allSkills = guildSkills.map((gs) => {
                const ra: ReincAbility = {
                    ...gs,
                    cost: 0,
                    enabled: true,
                    id: gaIdx++,
                    maxed: false,
                    trained: 0,
                }
                return ra
            })

            setAllSkills(allSkills)
            setSkills(allSkills)
            const allSpells = guildSpells.map((gs) => {
                const ra: ReincAbility = {
                    ...gs,
                    cost: 0,
                    enabled: true,
                    id: gaIdx++,
                    maxed: false,
                    trained: 0,
                }
                return ra
            })
            setAllSpells(allSpells)
            setSpells(allSpells)

        }
    }


    let transientContex: TransientReincType = {}
    const guildService = GuildService(creatorDataContext, values as ReincContextType)

    const reincFunctions: ReincFunctionsType = {
        updateAbility: addOrUpdateAbility,
        getAbility,
        getReincGuildByName,
        addOrUpdateGuild,
        setSkills,
        setSpells,
        setRace,
        setAllGuilds,
        setStats,
        guildService,
        setWishes,
        setBonusBaseStats,
        setSkillMax,
        setSpellMax,
        setAllSkills,
        setAllSpells,
        setCustomSkillMaxBonus,
        setCustomSpellMaxBonus,
        setCopyPasteSeparator,
        setHelpText,
        setDrawerOpen
    }

    let context = {...values, ...reincFunctions, ...transientContex,}
    context = {
        ...values, ...reincFunctions, ...transientContex,
        guildService: GuildService(creatorDataContext, context as ReincContextType)
    }

    transientContex = {...transientContex}

    const filterData = () => {
        const fd = doFilter(creatorDataContext, context as ReincContextType)
        console.debug("FILTERING DATA", fd)
        if (fd) setFilteredData({...fd})
    }

    transientContex = {...transientContex} as TransientReincType

    useEffect(() => {
        filterData()

    }, [skills, spells, level]);


// useEffect(() => {
//
//     setSkills(filteredData.skills)
//     setSpells(filteredData.spells)
//
// }, [filteredData]);

    useEffect(() => {
        const allGuilds = GuildService(creatorDataContext, context as ReincContextType).getMainGuilds()
            .map((g) => {
                return {...g, enabled: true} as FullGuild
            }) as FullGuild[]

        setAllGuilds(allGuilds)
        setGuilds(GuildService(creatorDataContext, context as ReincContextType).getMainGuilds() as FullGuild[])

        initAbilities(allGuilds)
    }, []);


    useEffect(() => {
        // const guildService = GuildService(creatorDataContext, context as ReincContextType)
        // setLevel(guildService.totalTrainedLevels() + freeLevels)
        // const untrainedGuilds = guilds.filter((g) => {
        //     return g.trained === 0
        // })
        //
        // console.debug("GUILDS", guilds)
        // if (untrainedGuilds.length > 0) {
        //     setGuilds(guilds.filter((g) => {
        //         return g.trained > 0
        //     }))
        // }


    }, [guilds]);

    useEffect(() => {
        /*

                const overTrainedSkills = skills.filter((s) => {
                    return s.trained > 0
                }).map((s) => {
                    return {...s}
                })
                console.debug("OVERTRAINED SKILLS", overTrainedSkills)
                setSkills([...skills.filter((s) => overTrainedSkills.find((s1) => s1.name !== s.name)), ...overTrainedSkills])

                const overTrainedSpells = spells.filter((s) => {
                    return s.trained > 0
                }).map((s) => {
                    return {...s,}
                })
                setSpells([...spells.filter((s) => overTrainedSpells.find((s1) => s1.name !== s.name)), ...overTrainedSpells])
        */

    }, [level]);


    useEffect(() => {
        const guildService = GuildService(creatorDataContext, context as ReincContextType)
        setLevel(guildService.totalTrainedLevels() + freeLevels)

    }, [guilds]);


    useEffect(() => {
        if (race) {
            const wishHandler = WishHandler(context)
            const knowledgeWishes = wishes.filter((w: Wish) => w.applied && w.name === "superior knowledge" || w.name === "better knowledge") || []
            knowledgeWishes.forEach((w) => wishHandler.cancel(w.name))

            setSkillMax(race?.skill_max || 100)
            setSpellMax(race?.spell_max || 100)

            knowledgeWishes.forEach((w) => wishHandler.apply(w.name))

            console.debug("SETTING MAXES", skillMax, spellMax)
        }
    }, [race])


    useEffect(() => {
        const wishHandler = WishHandler(context)
        wishes.filter((w) => !w.applied).forEach((w) => wishHandler.apply(w.name))
        console.debug("UPDATED WISHES", wishes)
    }, [race, wishes])


    return {...context, ...transientContex, guildService: GuildService(creatorDataContext, context)}

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