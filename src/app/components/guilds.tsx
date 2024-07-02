'use client'
import {styled} from '@mui/material/styles';
import {Stack, Typography} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Box from '@mui/material/Box';
import NumberInputBasic from './numberInput';
import SectionBox from './sectionBox';
import {useDeferredValue, useEffect, useState} from 'react';

const Item = styled(Typography)(({theme}) => ({
    // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    // ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'left',
    //  color: theme.palette.text.secondary,
}));

const setValue = (event, val) => {

}
export default function Guilds(props: { myData: Promise<Map<string, any>> }) {
    const [data, setData] = useState(new Map<string, any>)
    const deferredData = useDeferredValue(data)
    useEffect(() => {
        props.myData?.then((p) => {
            setData(p)
        })
    }, [props.myData])
    return (
        <SectionBox title='Guilds'>
            {deferredData?.get('guilds') ? (
                    <Grid container rowSpacing={1} columnSpacing={{xs: 1, sm: 2, md: 3}}>
                        {deferredData?.get('guilds').map((g) => {
                            return (
                                <Grid xs={3} key={g.name}>
                                    <Item>
                                        <Stack direction={'row'}>
                                            <Typography variant={'subtitle1'}
                                                        sx={{width: '70%'}}>{g.name.replaceAll("_", " ")}</Typography>
                                            <Box sx={{
                                                width: "50px",
                                                height: "30px",
                                                marginLeft: "15px",
                                                alignItems: 'center'
                                            }}>
                                                <NumberInputBasic
                                                    aria-label="guild levels input"
                                                    placeholder="0"
                                                    onChange={(event: any, val: any) => setValue(event, val)}
                                                />
                                            </Box>
                                        </Stack>
                                    </Item>
                                </Grid>
                            )
                        })}
                    </Grid>) :
                <></>
            }
        </SectionBox>
    )
}