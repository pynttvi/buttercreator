'use client'
import {Stack, Typography} from "@mui/material";
import RaceList from "@/app/components/races";
import Guilds from "@/app/components/guilds";
import AbilityList from "@/app/components/abilities";
import Reinc from "@/app/components/reinc";
import {Suspense, useCallback, useEffect, useState} from "react";
import {useReinc} from "@/app/contexts/reincContext";

export default function MainContent(props: { myData: Promise<Map<string, any>> }) {
    const reinc = useReinc()
    const [ready,setReady] = useState(false)
    useEffect(() => {
        props.myData.then((data)=> {
            reinc.creatorData = data
            setReady(true)
        })
    }, [])

    if (!ready || !reinc.creatorData) return <Typography variant={'h2'}> Loading...</Typography>

    return (
        <Suspense fallback={'Loading...'}>
            <Stack direction={"column"}>
                <RaceList myData={reinc.creatorData}/>
                <Guilds myData={reinc.creatorData}/>
                <Stack direction={"row"} spacing={"2"}>
                    <AbilityList type={"skills"} myData={reinc.creatorData}/>
                    <AbilityList type={"spells"} myData={reinc.creatorData}/>
                </Stack>
                <Reinc/>
            </Stack>
        </Suspense>
    )
}