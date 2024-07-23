import React, {PropsWithChildren, useContext, useEffect, useState} from 'react';
import {GuildType} from "@/app/components/guilds";
import {FullGuild, GuildUtils} from "@/app/utils/guildUtils";
import {useReinc} from "@/app/contexts/reincContext";
import {useCreatorData} from "@/app/contexts/creatorDataContext";


export type GuildContextType = {
    addOrUpdateGuild: (guildType: GuildType, guild: FullGuild, levels: number) => void

};

export const GuildContext = React.createContext<GuildContextType | null>(null)

export const GuildContextProvider = (props: PropsWithChildren<{}>) => {
    const creatorDataContext = useCreatorData()

    const [ready, setReady] = useState(false)
    const ctx = useContext(GuildContext)
    const reinc = useReinc()
    const {
        ready: reincReady,
        guilds,
        setGuilds,
        setAllGuilds,
    } = reinc


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

    useEffect(() => {
    }, [])


    const values = {
        addOrUpdateGuild,
    }

    useEffect(() => {
        if (reincReady && !ready) {
            const allGuilds = GuildUtils(creatorDataContext, reinc).getMainGuilds()
                .map((g) => {
                    return {...g, enabled: true} as FullGuild
                }) as FullGuild[]

            setAllGuilds(allGuilds)
            setGuilds(GuildUtils(creatorDataContext, reinc).getMainGuilds() as FullGuild[])
            setReady(true)
        }

    }, [reincReady]);


    return (
        <GuildContext.Provider value={{...ctx, ...values} as GuildContextType}>
            {props.children}
        </GuildContext.Provider>
    )
}

export const useGuildContext = (): GuildContextType => {
    const ctx = useContext(GuildContext)
    if (!ctx) {
        throw new Error("Creator data context error")
    }
    return ctx
}