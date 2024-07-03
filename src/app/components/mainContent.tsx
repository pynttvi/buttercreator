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
import Grid from "@mui/material/Unstable_Grid2";

export default function MainContent(props: { myData: Promise<Partial<CreatorDataType>> }) {

    return (
        <CreatorDataContextProvider creatorData={props.myData as Promise<CreatorDataType>}>
            <CreatorDataContext.Consumer>
                {value => (
                    !value?.creatorData ? (<Typography variant={'h2'}> Loading...</Typography>)
                        : (
                            <ReincContextProvider>
                                <Suspense fallback={'Loading...'}>
                                    <Grid container spacing={{xs: 2, md: 3}} columns={{xs: 1, sm: 2, md: 2}}>
                                        {/*@ts-ignore*/}
                                        <Grid item xs={2} sm={2} md={2} key={'races'}>
                                            <RaceList myData={value.creatorData}/>
                                        </Grid>
                                        {/*@ts-ignore*/}
                                        <Grid item xs={2} sm={1} md={2} key={'guild'}>
                                            <Guilds myData={value.creatorData}/>
                                        </Grid>
                                        {/*@ts-ignore*/}
                                        <Grid item xs={2} sm={2} md={1} key={'skills'}>
                                            <AbilityList type={"skills"} creatorData={value.creatorData}/>
                                        </Grid>
                                        {/*@ts-ignore*/}
                                        <Grid item xs={2} sm={2} md={1} key={'spells'}>
                                            <AbilityList type={"spells"} creatorData={value.creatorData}/>
                                        </Grid>
                                    </Grid>
                                    <Reinc/>
                            </Suspense>
                    </ReincContextProvider>)
                    )}
            </CreatorDataContext.Consumer>
        </CreatorDataContextProvider>

    )
}