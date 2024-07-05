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
import {GuildLevels} from "@/app/parsers/guildsFileParser";
import {Dispatch, FocusEventHandler, SetStateAction, useEffect, useState} from "react";
import {MainGuild} from "@/app/service/guildService";

const Item = styled(Typography)(({theme}) => ({
    padding: theme.spacing(1),
    textAlign: 'left',
}));

export type GuildType = 'main' | 'sub'
const setValue = (guildType: GuildType, guild: MainGuild, level: number, addOrUpdateGuild: (guildType: GuildType, guild: MainGuild, levels: number) => void) => {
    addOrUpdateGuild(guildType, {...guild, name: guild.name.toLowerCase().replaceAll("_", " ")}, level)
}

function GuildItem(props: {
    g: GuildLevels,
    onChange: (event: { currentTarget: HTMLInputElement }, value: number) => void,
    className: string,
    guild: MainGuild | undefined,
    onFocus: FocusEventHandler<Element>
    isSubguild?: boolean
}) {
    const reinc = useReinc()
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
                            value={reinc.getReincGuildByName(props.g.name)?.levels || 0}
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
    className: string,
    setLastClass: Dispatch<SetStateAction<string>>,
    addOrUpdateGuild: (guildType: GuildType, guild: MainGuild, levels: number) => void
}) => {
    const {guildService, addOrUpdateGuild} = useReinc()

    const {
        getMainGuilds,
        getGuildByName
    } = guildService

    const subguilds = getMainGuilds().find((mg) => mg.name === props.guild.name)?.subGuilds
    if (!subguilds || subguilds.length === 0) {
        return <></>
    }

    subguilds.forEach((sg, index: number) => {
        if (sg.name === props.guild.name) {
            subguilds[index].levels += sg.levels
        } else {
            const subSubGuilds = getMainGuilds().find((mg) => mg.name === sg.name)?.subGuilds || []
            if (subSubGuilds.length > 0) {
                subSubGuilds.forEach((ssg) => {
                    if (sg.name !== ssg.name) {
                        subguilds.push(ssg)
                    }
                })
            }
        }
    })


    return <>
        {subguilds.length > 0 && subguilds.map((sg) => (
            <>
                <GuildItem g={sg}
                           onChange={(event: {
                               currentTarget: HTMLInputElement;
                           }, value: number) => {
                               setValue('sub', sg, sg.levels, addOrUpdateGuild);
                           }}
                           className={props.className}
                           guild={getGuildByName(sg.name)}
                           onFocus={(event) => {
                               const reincGuild = getGuildByName(sg.name)
                               if (!reincGuild || reincGuild?.levels === 0) {
                                   setValue('sub', (sg), sg.levels, addOrUpdateGuild)
                               }
                               props.setLastClass(props.className)

                           }}
                           isSubguild={true}
                />
                {/*<SubguildsList guild={sg} className={props.className} setLastClass={props.setLastClass}/>*/}
            </>
        ))}

    </>;
}

export default function Guilds(props: { myData: CreatorDataType }) {
    const {
        addOrUpdateGuild,
        getReincGuildByGuildLevels,
        guildService,
        filteredData,
    } = useReinc()

    const {
        getGuildByName,
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
    return (
        <SectionBox title='Guilds'>
            <Grid container direction={"row"} gap={4} spacing={1} columns={{xs: 4, sm: 6, md: 12}}>
                {data?.guilds ? (
                        <>
                            {data?.guilds.sort((a, b) => b.levels - a.levels).map((g: MainGuild, index: number) => {
                                const className = `guild-${g.name}`
                                return (
                                    // @ts-ignore
                                    <Box sx={{minWidth: "400px"}}>
                                        <GuildItem g={g}
                                                   onChange={(event: {
                                                       currentTarget: HTMLInputElement;
                                                   }, value: number) => {
                                                       setValue('main', g, value, addOrUpdateGuild);
                                                   }}
                                                   className={className}
                                                   guild={getGuildByName(g.name)}
                                                   onFocus={(event) => {
                                                       if (!getGuildByName(g.name)) {
                                                           setValue('main', g, g.levels, addOrUpdateGuild)
                                                       }
                                                       setLastClass(className)

                                                   }}/>
                                        <SubguildsList guild={g} className={className} setLastClass={setLastClass}
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