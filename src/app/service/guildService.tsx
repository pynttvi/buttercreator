import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {ReincContextType} from "@/app/contexts/reincContext";
import {GuildLevels} from "@/app/parsers/guildsFileParser";
import {Guild, GuildLevel} from "@/app/parsers/guildParser";
import {GuildType} from "@/app/components/guilds";
import {onlyUnique} from "@/app/filters/creatorDataFilters";

export type GuildServiceType = {
    getMainGuilds: () => MainGuild[]
    getGuildByName: (name: string) => MainGuild | undefined
    maxSubguildsTrained: (guild: FullGuild) => boolean
    trainedLevelForGuild: (guild: FullGuild) => number
}

export interface SubGuild extends MainGuild {
    mainGuild: MainGuild
    name: string
    levels: number
    levelMap: Map<string, GuildLevel>
    subGuilds: SubGuild[]
}

export interface MainGuild {
    subGuilds: SubGuild[]
    guildType: GuildType
    name: string
    levels: number
    trained: number
    levelMap: Map<string, GuildLevel>
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

        return trained
    }

    const maxSubguildsTrained = (guild: FullGuild) => {
        return trainedLevelForGuild(guild) <= 60
    }
    const getMainGuilds = (): MainGuild[] => {
        const guilds = creatorDataContext.originalCreatorData.guilds.map((gl) => {
            const guild = getGuildByGuildLevels(gl)
            if (!guild) {
                console.log("Error getting guild", gl)
                throw new Error("Error getting guild")
            }
            const subGuildsPartial = guild.subGuildLevels.map((sgl) => {
                const sg = getGuildByGuildLevels(sgl)
                const subGuild: Partial<SubGuild> = {
                    ...sg,
                    ...sgl
                }
                return subGuild
            })
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

                constructor(mainGuildPartial: Partial<MainGuild>, subGuildsPartial: Partial<SubGuild>[]) {
                    this.guildType = 'main'
                    this.levels = mainGuildPartial.levels || -1
                    this.levelMap = mainGuildPartial.levelMap || new Map<string, GuildLevel>
                    this.name = mainGuildPartial.name?.toLowerCase().replaceAll("_", " ") || ""
                    this.trained = 0
                    this.subGuilds = subGuildsPartial.map((sgp) => {
                        const subGuild: SubGuild = {
                            name: sgp.name?.toLowerCase().replaceAll("_", " ") || "",
                            guildType: 'sub',
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
                            }
                            return subGuild
                        }) || []

                        return subGuild
                    })
                }
            }

            return new MainGuildImpl(mainGuildPartial, subGuildsPartial)
        })

        return guilds
    }
    const getGuildByName = (name: string): MainGuild | undefined => {
        return getMainGuilds().find((g) => g.name === name)
    }
    return {
        getMainGuilds,
        getGuildByName,
        maxSubguildsTrained,
        trainedLevelForGuild
    }
}