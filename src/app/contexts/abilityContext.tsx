import React, {PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {ReincAbility, useReinc} from "@/app/contexts/reincContext";
import {FullGuild} from "@/app/utils/guildUtils";
import {GuildAbility} from "@/app/parsers/guildParser";
import {useCreatorData} from "@/app/contexts/creatorDataContext";


export type AbilityContextType = {
    updateAbility: (type: 'skills' | 'spells', ability: ReincAbility | ReincAbility[]) => ReincAbility | ReincAbility[]
};

export const AbilityContext = React.createContext<AbilityContextType | null>(null)

export const AbilityContextProvider = (props: PropsWithChildren<{}>) => {
    const ctx = useContext(AbilityContext)
    const [ready, setReady] = useState(false)
    const creatorDataContext = useCreatorData()
    const reinc = useReinc()
    const {
        filteredData,
        setSkills,
        setSpells,
        setAllSpells,
        setAllSkills,
        allSpells,
        allSkills,
        allGuilds,
        level,
        skills,
        spells,
        race,
        wishes
    } = useMemo(() => {
        return reinc
    }, [reinc, reinc.skills, reinc.spells])


    const initAbilities = useCallback((guilds: FullGuild[]) => {


            let gaIdx = 0

            let guildAbilities: ReincAbility[] = []


            function addAbilities(guild: FullGuild) {

                if (level > 0 && guild.trained === 0) {
                    return
                }

                console.debug("ADDING ABILITYS!", guild.name, guild)
                for (let i = guild.levels + 2; i > 0; i--) {

                    const level = guild.levelMap.get(i.toString())

                    level?.abilities.forEach((guildAbility: GuildAbility) => {
                        const target = guildAbility.type === "skill" ? creatorDataContext.creatorData.skills : creatorDataContext.creatorData.spells
                        const a = target.find(a => a.name === guildAbility.name)

                        const ra: ReincAbility = {
                            enabled: true,
                            cost: a?.cost || 0,
                            id: gaIdx,
                            maxed: false,
                            guild: guild,
                            trained: 0,
                            ...guildAbility
                        }
                        guildAbilities.push(ra)
                    })
                }
            }

            if (allGuilds && allGuilds.length > 0 && !ready) {

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
        },
        [allGuilds]
    )

    const updateAbility = useCallback((type: 'skills' | 'spells', ability: ReincAbility | ReincAbility[]) => {
        let targetArray: ReincAbility[]
        if (type === "skills") {
            targetArray = reinc.skills
        } else {
            targetArray = reinc.spells
        }
        let newAbilities: ReincAbility[]

        function getNewAbility(oldAbility: ReincAbility, newAbility: ReincAbility) {
            if (oldAbility.name === newAbility.name) {
                oldAbility.trained = newAbility.trained

                if (newAbility.trained === newAbility.max) {
                    oldAbility.maxed = true
                }
                oldAbility.trained = newAbility.trained
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
            const a = ability as ReincAbility
            newAbilities = targetArray.map((oldAbility) => {
                return getNewAbility(oldAbility, a)
            })
        }

        console.debug("UPDATING ABILITY", ability, newA, newAbilities)

        if (type === "skills") {
            setSkills([...newAbilities])
        } else {
            setSpells([...newAbilities])
        }
        if (ability instanceof Array) {
            return newAbilities
        } else {
            return newA
        }
    }, [reinc.skills, reinc.spells])

    const values = {
        updateAbility
    }


    useEffect(() => {
        initAbilities(allGuilds)
    }, [allGuilds])
    useEffect(() => {

        if (level > 0) {
            const newSkills = skills.map((s) => {
                if (s.trained > s.max) {
                    s.trained = s.max
                }
                return {...s}
            })
            setSkills([...newSkills])

            const newSpells = spells.map((s) => {
                if (s.trained > s.max) {
                    s.trained = s.max
                }
                return {...s}
            })
            setSpells([...newSpells])
        }

    }, [level, race, wishes]);

    return (
        <AbilityContext.Provider value={{...ctx, ...values} as AbilityContextType}>
            {props.children}
        </AbilityContext.Provider>
    )
}

export const useAbilityContext = (): AbilityContextType => {
    const ctx = useContext(AbilityContext)
    if (!ctx) {
        throw new Error("Creator data context error")
    }
    return ctx
}