'use client'
import {styled} from '@mui/material/styles';
import {Typography} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import NumberInputBasic from './numberInput';
import SectionBox from './sectionBox';
import {CreatorDataType} from "@/app/parserFactory";
import {useReinc} from "@/app/contexts/reincContext";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import React, {Dispatch, FocusEventHandler, SetStateAction, useEffect, useState} from "react";
import {FullGuild, MainGuild} from "@/app/service/guildService";

const Item = styled(Typography)(({theme}) => ({
    padding: theme.spacing(1),
    textAlign: 'left',
}));

export type GuildType = 'main' | 'sub'
const updateValue = (guildType: GuildType, guild: FullGuild, level: number, addOrUpdateGuild: (guildType: GuildType, guild: FullGuild, levels: number) => void) => {
    addOrUpdateGuild(guildType, {...guild, name: guild.name}, level)
}

function GuildItem(props: {
    g: FullGuild,
    onChange: (event: { currentTarget: HTMLInputElement }, value: number) => void,
    className: string,
    guild: FullGuild | undefined,
    onFocus: FocusEventHandler<Element>
    isSubguild?: boolean
}) {
    const reinc = useReinc()
    const [value, setValue] = useState(0)

    useEffect(() => {
        setValue(reinc.getReincGuildByName(props.g.name)?.trained || 0)
    }, [reinc.guilds]);

    return (
        // @ts-ignore
        <Grid item direction={"row"} xs={12} sm={6} md={4} key={'index-' + props.g.name}>
            <Box sx={{minWidth: "400px"}}>

                <Item>
                    <Typography variant={"subtitle1"}
                                sx={{
                                    width: "70%",
                                    textTransform: 'capitalize',
                                    ...(props.isSubguild ? {paddingLeft: '20px'} : {})
                                }}>{props.g.name.replaceAll("_", " ")}</Typography>
                    <Box sx={{
                        width: "50px",
                        height: "30px",
                        marginLeft: "15px",
                        alignItems: "center"
                    }}>
                        <NumberInputBasic
                            aria-label="guild levels input"
                            placeholder="0"
                            onChange={props.onChange}
                            className={props.className}
                            value={value}
                            onFocus={props.onFocus}
                        />
                    </Box>
                </Item>
            </Box>
        </Grid>
    )
}

const SubguildsList = (props: {
    guild: MainGuild,
    setLastClass: Dispatch<SetStateAction<string>>,
    addOrUpdateGuild: (guildType: GuildType, guild: FullGuild, trained: number) => void
}) => {
    const {guildService, addOrUpdateGuild} = useReinc()

    const {
        getMainGuilds,
        getGuildByName,
        maxSubguildsTrained
    } = guildService

    const subguilds = props.guild.subGuilds
    if (!subguilds || subguilds.length === 0) {
        return <></>
    }

    return <>
        {subguilds.length > 0 && subguilds.map((sg) => {
            const className = `guild-${sg.name}`
            return (
                <>
                    <GuildItem g={sg}
                               onChange={(event: {
                                   currentTarget: HTMLInputElement;
                               }, value: number) => {
                                   updateValue('sub', sg, value, addOrUpdateGuild);
                               }}
                               className={className}
                               guild={getGuildByName(sg.name) as FullGuild}
                               onFocus={(event) => {
                                   const reincGuild = getGuildByName(sg.name)
                                   if (!reincGuild || reincGuild?.levels === 0) {
                                       updateValue('sub', (sg), sg.levels, addOrUpdateGuild)
                                   }
                                   props.setLastClass(className)
                                   maxSubguildsTrained(sg)

                               }}
                               isSubguild={true}
                    />
                    {/*<SubguildsList guild={sg} className={props.className} setLastClass={props.setLastClass}/>*/}
                </>
            )
        })}
    </>;
}

export default function Guilds(props: { myData: CreatorDataType }) {
    const {
        addOrUpdateGuild,
        guildService,
        filteredData,
        guilds
    } = useReinc()

    const {
        getGuildByName,
        maxSubguildsTrained,
    } = guildService

    const {creatorData} = useCreatorData()


    const [lastClass, setLastClass] = useState("")
    const focusClass = (className: string) => {
        (async () => {
            await new Promise(resolve => setTimeout(resolve, 50));
            const active: HTMLInputElement | null = document.querySelector(`.${className || 'none'} .base-NumberInput-input`);
            if (active) {
                active?.focus();
                active?.select();
            }
        })()
    }

    useEffect(() => {
        focusClass(lastClass)
    }, [lastClass]);

    const data = filteredData  //creatorData
    console.log("DATA", data)
    console.log("REINC", guilds)
    return (
        <SectionBox title='Guilds'>
            <Grid container direction={"row"} gap={4} spacing={1} columns={{xs: 4, sm: 6, md: 12}}>
                {data?.guilds ? (
                        <>
                            {data?.guilds.sort((a, b) => b.levels - a.levels).map((g: FullGuild, index: number) => {
                                const className = `guild-${g.name}`
                                return (
                                    // @ts-ignore
                                    <Box sx={{minWidth: "400px"}}>
                                        <GuildItem g={g as FullGuild}
                                                   onChange={(event: {
                                                       currentTarget: HTMLInputElement;
                                                   }, value: number) => {
                                                       updateValue('main', g, value, addOrUpdateGuild);
                                                   }}
                                                   className={className}
                                                   guild={getGuildByName(g.name) as FullGuild}
                                                   onFocus={(event: React.FocusEvent<HTMLInputElement>) => {
                                                       updateValue('main', g, g.levels, addOrUpdateGuild)
                                                       setLastClass(className)
                                                       maxSubguildsTrained(g as FullGuild)

                                                   }}/>
                                        <SubguildsList guild={g} setLastClass={setLastClass}
                                                       addOrUpdateGuild={addOrUpdateGuild}/>
                                    </Box>
                                )
                            })}
                        </>) :
                    <></>
                }

            </Grid>
        </SectionBox>
    )
}