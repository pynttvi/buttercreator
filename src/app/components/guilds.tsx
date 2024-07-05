'use client'
import {styled} from '@mui/material/styles';
import {Typography} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import SectionBox from './sectionBox';
import {CreatorDataType} from "@/app/parserFactory";
import {MAX_LEVEL, useReinc} from "@/app/contexts/reincContext";
import {useCreatorData} from "@/app/contexts/creatorDataContext";
import React, {Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState} from "react";
import {FullGuild, GuildService, MAX_GUILD_LEVELS} from "@/app/service/guildService";
import NumberInputBasic from "@/app/components/numberInput";
import {GridDeleteIcon} from "@mui/x-data-grid";
import {Guild} from "@/app/parsers/guildParser";

const Item = styled(Typography)(({theme}) => ({
    padding: theme.spacing(1),
    textAlign: 'left',
}));

export type GuildType = 'main' | 'sub'


function GuildItem(props: {
    guild: FullGuild,
    isSubguild: boolean,
    setLastClass: Dispatch<SetStateAction<string>>,

}) {
    const [value, setValue] = useState(0)
    const [trainedForGuild, setTrainedFroGuild] = useState(0)
    const [disabled, setDisabled] = useState(false)
    const reinc = useReinc()
    const {
        addOrUpdateGuild,
        level, guilds,
    } = reinc

    const creatorDataContext = useCreatorData()

    const onFocus = (event: React.FocusEvent<HTMLInputElement>) => {
        if (value === 0) {
            setValue(Math.min(props.guild.levels, MAX_GUILD_LEVELS - trainedForGuild, MAX_LEVEL - level) || 0)
        }
        props.setLastClass(className)
    }

    useEffect(() => {
        addOrUpdateGuild(props.guild.guildType, props.guild, value)
    }, [value]);

    function checkGuilds() {
        const trained = GuildService(creatorDataContext, reinc).trainedLevelForGuild(props.guild)
        setTrainedFroGuild(trained)
        setDisabled(trainedForGuild >= MAX_GUILD_LEVELS || level >= MAX_LEVEL || (props.isSubguild && trainedForGuild < 45))
    }

    useMemo(() => {
        checkGuilds();
    }, [guilds]);

    useEffect(() => {
        checkGuilds()
    }, [reinc.guilds, value, props.guild]);

    const className = `guild-${props.guild.name} ${disabled ? 'disabled' : ''}`

    const onChange = (value: number | null) => {
        setValue(value || 0)
    }

    function deleteGuild(guild: FullGuild) {
        if (disabled || level === MAX_LEVEL) {
            setValue(1)
            addOrUpdateGuild(guild.guildType, guild, 1)
            props.setLastClass(className)
        } else {
            setValue(0)
            addOrUpdateGuild(guild.guildType, guild, 0)
        }
    }

    const onDelete = () => {
        deleteGuild(props.guild)
    };
    return (
        <>
            {/*// @ts-ignore*/}
            <Grid item direction={"row"} xs={12} sm={6} md={4} key={'index-' + props.guild.name}>
                <Box sx={{minWidth: "400px"}}>

                    <Item>
                        <Typography variant={"subtitle1"}
                                    sx={{
                                        width: "70%",
                                        textTransform: 'capitalize',
                                        ...(props.isSubguild ? {paddingLeft: '20px'} : {})
                                    }}>{props.guild.name.replaceAll("_", " ")}
                            {value > 0 && !(!props.isSubguild && trainedForGuild > 45) && (
                                < GridDeleteIcon sx={{marginLeft: '10px'}} onClick={onDelete}/>)}</Typography>
                        <Box sx={{
                            width: "50px",
                            height: "30px",
                            marginLeft: "15px",
                            alignItems: "center"
                        }}>
                            <NumberInputBasic
                                aria-label="guild levels input"
                                placeholder="0"
                                onChange={(_event: any, value1: number | null) => onChange(value1)}
                                className={className}
                                value={value}
                                onFocus={onFocus}
                                disabled={disabled}
                            />
                        </Box>
                    </Item>
                </Box>
            </Grid>
            {props.guild.subGuilds.map((sg) => {
                return (
                    <>
                        <GuildItem guild={sg} setLastClass={props.setLastClass} isSubguild={true}/>
                    </>
                )
            })}
        </>
    )
}

export default function Guilds(props: { myData: CreatorDataType }) {
    const {
        addOrUpdateGuild,
        filteredData,
        guilds
    } = useReinc()


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
                                        <GuildItem guild={g as FullGuild} isSubguild={false} setLastClass={setLastClass}/>
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