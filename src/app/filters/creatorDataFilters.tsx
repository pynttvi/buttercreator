'use client'
import {Ability} from "@/app/parsers/abilityCostParser";
import {CreatorDataContextType} from "@/app/contexts/creatorDataContext";
import {FullGuild} from "@/app/service/guildService";
import {GuildAbility} from "@/app/parsers/guildParser";
import {onlyUniqueNameWithHighestMax, sortByName} from "@/app/filters/utils";
import {ReincAbility, ReincContextType} from "@/app/contexts/reincContext";

export type CreatorDataFilterType = {
    doFilter: () => { skills: Ability[], spells: Ability[] } | FullGuild[]
}


export const trainedAbilities = (reinc: ReincContextType) => {
    const skills = reinc.skills.filter((s) => s.trained > 0)
    const spells = reinc.spells.filter((s) => s.trained > 0)
    return {skills, spells, totalCount: skills.length + spells.length}
}

export const doFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincContextType, lastCount?: number) => {
    if (reinc) {
        const abilities = AbilitiesByGuildsFilter(creatorDataContext, reinc).doFilter() as {
            skills: ReincAbility[],
            spells: ReincAbility[]
        }
        return {
            skills: abilities.skills,
            spells: abilities.spells,
            guilds: GuildsByAbilitiesFilter(creatorDataContext, reinc).doFilter()
        }
    }
}


export const AbilitiesByGuildsFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincContextType): CreatorDataFilterType => {
    const {creatorData} = creatorDataContext

    return {
        doFilter: (): { skills: Ability[], spells: Ability[] } => {
            let guildAbilities: ReincAbility[] = []
            let guilds: FullGuild[] = []
            const allGuilds = reinc.allGuilds

            if (reinc.guilds.length !== 0) {
                guilds = reinc.guilds
            } else {
                guilds = allGuilds
            }

            let reincSkills: ReincAbility[] = reinc.skills
            let reincSpells: ReincAbility[] = reinc.spells
            let gaIdx = 0


            function addAbilities(guild: FullGuild) {

                if (guild.trained === 0) {
                    return
                }
                console.debug("ADDING ABILITIS!", guild.name, guild)
                for (let i = guild.levels; i > 0; i--) {

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
                addAbilities(guild)

            })

            guildAbilities = onlyUniqueNameWithHighestMax(guildAbilities)
            console.debug("REINC GUILDS", reinc.guilds)
            const guildSkills = guildAbilities.filter(ga => ga.type === 'skill')
            const guildSpells = guildAbilities.filter(ga => ga.type === 'spell')

            console.debug("GUILD ABILITIS", guildSkills, guildSpells)
            console.debug("REINC ABILITIS", reincSkills, reincSpells)

            let newSkills: ReincAbility[] = []
            let newSpells: ReincAbility[] = []

            if (reincSkills.length === 0 && reincSpells.length === 0) {
                reincSkills = guildSkills.map((gs) => {
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

                reincSpells = guildSpells.map((gs) => {
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
            }
            console.debug("FILTERING ABILITIES", reincSkills)

            reincSkills.forEach(rs => {
                const gs = guildSkills.find(gs => gs.name === rs.name)
                const enabled = !!gs
                newSkills.push({...rs, enabled, max: gs?.max || rs.max, guild: gs?.guild || rs.guild})
            })

            reincSpells.forEach(rs => {
                const gs = guildSpells.find(gs => gs.name === rs.name)
                const enabled = !!gs
                newSpells.push({...rs, enabled, max: gs?.max || rs.max, guild: gs?.guild || rs.guild})
            })

            console.debug("NEW SKILLS", newSkills)
            console.debug("Attack", newSkills.find(ns => ns.name === "attack"))
            return {skills: onlyUniqueNameWithHighestMax(newSkills), spells: onlyUniqueNameWithHighestMax(newSpells)}
        }
    }
}

export const GuildsByAbilitiesFilter = (creatorDataContext: CreatorDataContextType, reinc: ReincContextType): CreatorDataFilterType => {

    return {
        doFilter: () => {
            let guilds: FullGuild[] = []

            const allGuilds = reinc.allGuilds as FullGuild[]

            const {totalCount} = trainedAbilities(reinc)


            function addGuild(guild: FullGuild) {
                if (!guilds.find((g: FullGuild) => g.name === guild.name)) {
                    const existingGuild = reinc.guildService.getReincGuildByName(guild.name)
                    guilds.push(existingGuild || guild as FullGuild)
                }
            }

            function addNewGuild(guild: FullGuild) {
                if (!newGuilds.find((g: FullGuild) => g.name === guild.name)) {
                    const existingGuild = reinc.guildService.getReincGuildByName(guild.name)
                    newGuilds.push(existingGuild || guild as FullGuild)
                }
            }


            if (reinc.level === 0) {
                allGuilds.forEach((g) => {
                    addGuild(g)
                })
            } else {
                reinc.guilds.forEach(rg => addGuild(rg))
            }


            let newGuilds: FullGuild[] = []

            function filterByAbility(g: FullGuild, ability: Ability) {
                g.subGuilds.forEach((sg => {
                    filterByAbility(sg, ability)
                }))
                for (let i = g.levelMap.size; i > 0; i--) {
                    const level = g.levelMap.get(i.toString())
                    level?.abilities.forEach((guildAbility: GuildAbility) => {
                        if (ability.name.trim() === guildAbility.name.trim() && ability.trained <= guildAbility.max) {
                            if (g.guildType === "sub") {
                                addNewGuild(g.mainGuild as FullGuild)
                            }
                            addNewGuild(g)
                        }
                    })
                }
            }

            if (reinc.guilds.length === 0) {
                const trainedSkills = reinc.skills.filter((s) => s.trained > 0)
                trainedSkills.forEach((ability) => {
                    guilds.forEach((g) => {
                        filterByAbility(g, ability);
                    })
                })

                const trainedSpells = reinc.spells.filter((s) => s.trained > 0)
                trainedSpells.forEach((ability) => {
                    guilds.forEach((g) => {
                        filterByAbility(g, ability);
                    })
                })
            }
            newGuilds = (newGuilds?.length === 0 ? guilds : newGuilds) as FullGuild[]

            console.debug("Filtering guilds", newGuilds)
            return newGuilds
        }
    }
}