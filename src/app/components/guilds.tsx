'use client'
import {styled} from '@mui/material/styles';
import {Stack, Typography} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import NumberInputBasic from './numberInput';
import SectionBox from './sectionBox';
import {CreatorDataType} from "@/app/parserFactory";
import {ReincGuild, useReinc} from "@/app/contexts/reincContext";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import {GuildLevels} from "@/app/parsers/guildsFileParser";
import {Dispatch, FocusEventHandler, SetStateAction, useEffect, useState} from "react";

const Item = styled(Typography)(({theme}) => ({
    padding: theme.spacing(1),
    textAlign: 'left',
}));

const setValue = (guild: GuildLevels, level: number, addOrUpdateGuild: (guild: GuildLevels, levels: number) => void) => {
    addOrUpdateGuild(guild, level)
}

function GuildItem(props: {
    g: GuildLevels,
    onChange: (event: { currentTarget: HTMLInputElement }, value: number) => void,
    className: string,
    guild: ReincGuild | undefined,
    onFocus: FocusEventHandler<Element>
    isSubguild?: boolean
}) {
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
                            value={props.guild?.levels || 0}
                            onFocus={props.onFocus}
                        />
                    </Box>
                </Item>
            </Box>
        </Grid>
    )
}

const SubguildsList = (props: {
    guild: GuildLevels,
    className: string,
    setLastClass: Dispatch<SetStateAction<string>>,
    addOrUpdateGuild: (guild: GuildLevels, levels: number) => void
}) => {
    const {getReincGuildByGuildLevels, getSubguildsByGuildName} = useReinc()

    const subguilds = getSubguildsByGuildName(props.guild.name)
    if (!subguilds || subguilds.length === 0) {
        return <></>
    }

    subguilds.forEach((sg, index: number) => {
        if (sg.name === props.guild.name) {
            subguilds[index].value += sg.value
        } else {
            const subSubGuilds = getSubguildsByGuildName(sg.name)
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
                               setValue(sg, value, props.addOrUpdateGuild);
                           }}
                           className={props.className}
                           guild={getReincGuildByGuildLevels({name: sg.name.toLowerCase()})}
                           onFocus={(event) => {
                               if (!getReincGuildByGuildLevels({name: sg.name.toLowerCase()})) {
                                   setValue(sg, sg.value, props.addOrUpdateGuild)
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
    const {addOrUpdateGuild, getReincGuildByGuildLevels, getSubguildsByGuildName} = useReinc()
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


    return (
        <SectionBox title='Guilds'>
            <Grid container direction={"row"} gap={4} spacing={1} columns={{xs: 4, sm: 6, md: 12}}>
                {creatorData?.guilds ? (
                        <>
                            {creatorData?.guilds.sort((a, b) => b.value - a.value).map((g: GuildLevels, index: number) => {
                                const className = `guild-${g.name}`
                                return (
                                    // @ts-ignore
                                    <Box sx={{minWidth: "400px"}}>
                                        <GuildItem g={g}
                                                   onChange={(event: {
                                                       currentTarget: HTMLInputElement;
                                                   }, value: number) => {
                                                       setValue(g, value, addOrUpdateGuild);
                                                   }}
                                                   className={className}
                                                   guild={getReincGuildByGuildLevels({name: g.name.toLowerCase()})}
                                                   onFocus={(event) => {
                                                       if (!getReincGuildByGuildLevels({name: g.name.toLowerCase()})) {
                                                           setValue(g, g.value, addOrUpdateGuild)
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