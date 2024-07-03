'use client'
import {Stack, Typography} from "@mui/material";
import RaceList from "@/app/components/races";
import Guilds from "@/app/components/guilds";
import AbilityList from "@/app/components/abilities";
import Reinc from "@/app/components/reinc";
import {Suspense, useEffect, useState} from "react";
import {ReincContextProvider} from "@/app/contexts/reincContext";
import {CreatorDataType} from "@/app/parserFactory";
import {CreatorDataContext, CreatorDataContextProvider} from "@/app/contexts/creatorDataContext";

export default function MainContent(props: { myData: Promise<CreatorDataType> }) {

    return (
        <CreatorDataContextProvider creatorData={props.myData}>
            <CreatorDataContext.Consumer>
                {value => (
                    !value?.creatorData ? (<Typography variant={'h2'}> Loading...</Typography>)
                        : (
                            <ReincContextProvider>
                                <Suspense fallback={'Loading...'}>
                                    <Stack direction={"column"}>
                                        <RaceList myData={value.creatorData}/>
                                        <Guilds myData={value.creatorData}/>
                                        <Stack direction={"row"} spacing={"2"}>
                                            <AbilityList type={"skills"} creatorData={value.creatorData}/>
                                            <AbilityList type={"spells"} creatorData={value.creatorData}/>
                                        </Stack>
                                        <Reinc/>
                                    </Stack>
                                </Suspense>
                            </ReincContextProvider>)
                )}
            </CreatorDataContext.Consumer>
        </CreatorDataContextProvider>

    )
}