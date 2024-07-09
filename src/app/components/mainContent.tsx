'use client'
import {Typography} from "@mui/material";
import RaceList from "@/app/components/races";
import Guilds from "@/app/components/guilds";
import AbilityList from "@/app/components/abilities";
import Reinc from "@/app/components/reinc";
import {Suspense} from "react";
import {ReincContextProvider} from "@/app/contexts/reincContext";
import {CreatorDataType} from "@/app/parserFactory";
import {CreatorDataContext, CreatorDataContextProvider} from "@/app/contexts/creatorDataContext";
import Grid from "@mui/material/Unstable_Grid2";
import StatsList from "@/app/components/stats";
import WishList from "@/app/components/wish";

export default function MainContent(props: { myData: Promise<Partial<CreatorDataType>> }) {

    return (
        <CreatorDataContextProvider creatorData={props.myData as Promise<CreatorDataType>}>
            <CreatorDataContext.Consumer>
                {value => (
                    !value?.creatorData ? (<Typography variant={'h2'}> Loading...</Typography>)
                        : (
                            <ReincContextProvider>
                                <Suspense fallback={'Loading...'}>
                                    <Grid container spacing={{xs: 2, md: 3}} columns={{xs: 12, sm: 12, md: 12}}>
                                        {/*@ts-ignore*/}
                                        <Grid item xs={12} sm={9} md={9} key={'races'}>
                                            <RaceList myData={value.creatorData}/>
                                        </Grid>

                                        {/*@ts-ignore*/}
                                        <Grid item xs={12} sm={12} md={12} key={'guild'}>
                                            <Guilds myData={value.creatorData}/>
                                        </Grid>
                                        {/*@ts-ignore*/}
                                        <Grid item xs={12} sm={12} md={12} lg={6} key={'skills'}>
                                            <AbilityList type={"skills"} creatorData={value.creatorData}/>
                                        </Grid>
                                        {/*@ts-ignore*/}
                                        <Grid item xs={12} sm={12} md={12} lg={6} key={'spells'}>
                                            <AbilityList type={"spells"} creatorData={value.creatorData}/>
                                        </Grid>
                                        {/*@ts-ignore*/}
                                        <Grid item xs={12} sm={12} md={6} lg={6} key={'stats'}>
                                            <StatsList/>
                                        </Grid>
                                        {/*@ts-ignore*/}
                                        <Grid item xs={12} sm={12} md={6} lg={6} key={'wishes'}>
                                            <WishList/>
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