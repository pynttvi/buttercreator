'use client'
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {MAX_LEVEL, ReincAbility, ReincContextType} from "@/app/contexts/reincContext";
import {GuildLevels} from "@/app/parsers/guildsFileParser";
import {Guild, GuildLevel} from "@/app/parsers/guildParser";
import {GuildType} from "@/app/components/guilds";
import {onlyUnique, simplifyStat, sortByName} from "@/app/filters/utils";

export const MAX_GUILD_LEVELS = 60
export type GuildServiceType = {
    getMainGuilds: () => MainGuild[]
    getGuildByName: (name: string) => FullGuild | undefined
    getReincGuildByName: (name: string) => FullGuild | undefined
    maxSubguildsTrained: (guild: FullGuild) => boolean
    trainedLevelForGuild: (guild: FullGuild) => number
    totalTrainedLevels: () => number
    maxForGuilds: (ability: ReincAbility, guilds: FullGuild[], max?: number) => number
    getAllGuildsFlat: () => FullGuild[]
    getReincGuildsFlat: () => FullGuild[]
    getStatTotalFromGuilds: (stat: string) => number
}

export interface SubGuild extends MainGuild {
    mainGuild: MainGuild
    name: string
    levels: number
    levelMap: Map<string, GuildLevel>
    subGuilds: SubGuild[]
    enabled: boolean
}

export interface MainGuild {
    subGuilds: SubGuild[]
    guildType: GuildType
    name: string
    levels: number
    trained: number
    levelMap: Map<string, GuildLevel>
    enabled: boolean
}

export type FullGuild = SubGuild & MainGuild

export function GuildService(creatorDataContext: CreatorDataContextType, reincContext: ReincContextType): GuildServiceType {
    const getGuildByGuildLevels = (guild: Partial<GuildLevels>): Guild | undefined => {
        // @ts-ignore
        return creatorDataContext.originalCreatorData[`guild_${guild.name?.toLowerCase().replaceAll(" ", "_")}`]
    }
    const getGuildLevelsFromGuild = (guild: Guild): GuildLevels => {
        return {name: guild.name, levels: Object.keys(guild.levelMap.keys()).length}
    }
    const getSubguildsFromGuild = (guild: Guild | undefined): GuildLevels[] => {
        const subGuilds: GuildLevels[] = []
        if (guild) {
            Object.entries(guild.subGuildLevels).forEach((entry) => {
                subGuilds.push({...entry[1], name: entry[1].name.toLowerCase().replaceAll("_", " ")})
            })
        }
        return subGuilds
    }

    const getSubguildsByGuildName = (name: string): GuildLevels[] => {
        return getSubguildsFromGuild(getGuildByGuildLevels({name}))
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
                        subguild?.subGuildLevels.forEach((sg1) => {
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

    const getAllGuildAndSubguildLevels = (): GuildLevels[] => {
        return getAllGuildsAndSubguilds().map((g: Guild): GuildLevels => {
            return {name: g.name, levels: Object.keys(g.levelMap.keys()).length}
        })
    }

    const trainedLevelForGuild = (guild: FullGuild) => {
        let trained = 0
        let trainedSubs = 0
        if (!guild) {
            return 0
        }
        const matchinSiblings = []
        matchinSiblings.push(...reincContext.guilds.filter((g) => {
                return g.name === guild.name
            })
        )

        matchinSiblings.push(...reincContext.guilds.filter((g) => {
                return (g.mainGuild && guild.mainGuild && g.mainGuild?.name === guild.mainGuild?.name)
            })
        )
        matchinSiblings.push(...reincContext.guilds.filter((g) => {
                return g.name === guild.mainGuild?.name
            })
        )
        matchinSiblings.push(...reincContext.guilds.filter((g) => {
                return g.mainGuild?.name === guild.name
            })
        )


        matchinSiblings.filter(onlyUnique).map((g) => {
            return g.trained
        }).forEach((n) => trained = trained + n)
        matchinSiblings.filter(onlyUnique).map((g) => {
            return g.subGuilds?.forEach((n) => trainedSubs = trainedSubs + n.trained)
        })

        return Math.min(MAX_GUILD_LEVELS, trained + trainedSubs)
    }

    const maxSubguildsTrained = (guild: FullGuild) => {
        return trainedLevelForGuild(guild) >= MAX_GUILD_LEVELS
    }

    const totalTrainedLevels = () => {
        let trained = 0
        let trainedSubs = 0
        trained = (reincContext?.guilds?.map((g) => g.trained) || [0])?.reduce((a, b) => a + b, 0)
        trainedSubs = (reincContext?.guilds?.map((g) => g.subGuilds.map((sg) => sg.trained)?.reduce((a, b) => a + b, 0)))?.reduce((a, b) => a + b, 0)

        console.debug("Total trained", trained)
        return Math.min(trained + trainedSubs, MAX_LEVEL)
    }

    const getAllGuildsFlat = () => {
        const flatGuilds: FullGuild[] = []

        function addGuilds(guild: FullGuild) {
            flatGuilds.push(guild)
            guild.subGuilds.forEach(sg => addGuilds(sg))
        }

        reincContext.allGuilds.forEach(g => addGuilds(g))
        return flatGuilds
    }

    const getStatTotalFromGuilds = (stat: string): number => {
        let statTotal = 0
        const flatGuilds: FullGuild[] = getReincGuildsFlat()
        flatGuilds
            .filter(g => g.trained > 0)
            .forEach((g) => {
                const levelArray = Array.from(g.levelMap)
                for (let i = 0; i < g.trained; i++) {
                    const guildLevel = levelArray[0][1]
                    guildLevel.stats.forEach((s) => {
                        let match = false

                        if (simplifyStat(s.name) === simplifyStat(stat)) {
                            statTotal += s.value
                            match = true

                            if (!match) {
                                if (s.name.trim().toLowerCase() === stat.trim().toLowerCase()) {
                                    statTotal += s.value
                                    match = true
                                }
                            }
                        }
                    })
                }
            })
        return statTotal
    }

    const getReincGuildsFlat = () => {
        const flatGuilds: FullGuild[] = []

        function addGuilds(guild: FullGuild) {
            if (guild.trained > 0) {
                flatGuilds.push(guild)
                guild.subGuilds.forEach(sg => addGuilds(sg))
            }
        }

        reincContext.guilds.forEach(g => addGuilds(g))
        return flatGuilds
    }

    const getMainGuilds = (): MainGuild[] => {
        if (reincContext?.allGuilds?.length > 0) {
            console.debug("GETTING cached guilds")
            return reincContext.allGuilds
        }
        const guilds = creatorDataContext.originalCreatorData.guilds.map((gl) => {
                const guild = getGuildByGuildLevels(gl)
                if (!guild) {
                    console.log("Error getting guild", gl)
                    throw new Error("Error getting guild")
                }

                function getSubGuilds(guild: GuildLevels) {
                    const g = getGuildByGuildLevels(guild)

                    const subGuilds = g?.subGuildLevels.map((sgl) => {
                        const sg = getGuildByGuildLevels(sgl)
                        const subGuild: SubGuild = {
                            ...sg,
                            ...sgl,
                        } as unknown as SubGuild
                        // subGuild.subGuilds = getSubGuilds(gl) || []
                        return subGuild
                    })
                    return subGuilds || []

                }

                let subGuilds = getSubGuilds(gl)
                const flatSubguilds: SubGuild[] = []
                subGuilds.forEach((sg) => {
                    flatSubguilds.push(sg)
                    getSubGuilds(sg).forEach((sg1) => {
                        const foundIdx = flatSubguilds.findIndex((sg2) => sg1.name == sg2.name)
                        if (foundIdx !== -1) {
                            flatSubguilds[foundIdx].levels += sg1.levels
                        } else {
                            flatSubguilds.push(sg1)
                        }
                    })
                })
                subGuilds = flatSubguilds

                //  console.debug("GUILD LEVELS", guild)


                const mainGuildPartial: Partial<MainGuild> = {
                    ...guild,
                    ...gl,
                }

                class MainGuildImpl implements MainGuild {
                    guildType: GuildType;
                    levelMap: Map<string, GuildLevel>;
                    levels: number;
                    name: string;
                    subGuilds: SubGuild[];
                    trained: number;
                    enabled: boolean;

                    constructor(mainGuildPartial: Partial<MainGuild>, subGuildsPartial: Partial<SubGuild>[]) {
                        this.guildType = 'main'
                        this.levels = mainGuildPartial.levels || -1
                        this.levelMap = mainGuildPartial.levelMap || new Map<string, GuildLevel>
                        this.name = mainGuildPartial.name?.toLowerCase().replaceAll("_", " ") || ""
                        this.trained = 0
                        this.enabled = true
                        this.subGuilds = sortByName<SubGuild>(subGuildsPartial as SubGuild[]).map((sgp: SubGuild) => {
                            const subGuild: SubGuild = {
                                name: sgp.name?.toLowerCase().replaceAll("_", " ") || "",
                                guildType: 'sub',
                                enabled: true,
                                mainGuild: this,
                                levels: sgp.levels || -1,
                                //levels: Object.keys((sgp as SubGuild).levelMap?.keys())?.length || -1,
                                levelMap: sgp.levelMap || new Map<string, GuildLevel>,
                                subGuilds: [],
                                trained: 0,
                            }
                            subGuild.subGuilds = sgp.subGuilds?.map((sgp) => {
                                const subGuild: SubGuild = {
                                    name: sgp.name?.toLowerCase().replaceAll("_", " ") || "",
                                    mainGuild: this,
                                    guildType: 'sub',
                                    levels: sgp.levels || -1,
                                    levelMap: sgp.levelMap || new Map<string, GuildLevel>,
                                    subGuilds: [],
                                    trained: 0,
                                    enabled: true
                                }
                                return subGuild
                            }) || []

                            return subGuild
                        })
                    }
                }

                return new MainGuildImpl(mainGuildPartial, subGuilds)
            }
        )
        if (reincContext.setAllGuilds) {
            console.debug("SETTING ALL GUILDS")
            reincContext.setAllGuilds(guilds as FullGuild[])
        }
        return guilds
    }

    const getGuildByName = (name: string): FullGuild | undefined => {
        return getMainGuilds().find((g) => g.name === name) as FullGuild
    }
    const getReincGuildByName = (name: string): FullGuild | undefined => {
        let guild = reincContext.guilds.find((g) => g.name === name)
        if (!guild) {
            const subs = reincContext?.guilds?.map((g) => g.subGuilds).reduce((a, b) => a.concat(b), [])
            guild = subs.find((sg) => sg.name === name)
        }
        return guild
    }
    const maxForGuilds = (ability: ReincAbility, guilds: FullGuild[], max: number = 0): number => {
        guilds?.forEach((guild) => {
            for (let i = guild.trained; i > 0; i--) {
                const level = guild.levelMap.get(i.toString())
                level?.abilities.forEach((a) => {
                    if (a.name === ability.name && a.max > max) {
                        max = a.max
                    }
                })
            }
            if (guild.subGuilds.length > 0) {
                return maxForGuilds(ability, guild.subGuilds, max)
            }
        })
        return max;
    }

    return {
        getMainGuilds,
        getGuildByName,
        maxSubguildsTrained,
        trainedLevelForGuild,
        totalTrainedLevels,
        getReincGuildByName,
        maxForGuilds,
        getAllGuildsFlat,
        getReincGuildsFlat,
        getStatTotalFromGuilds
    }
}