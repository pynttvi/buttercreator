'use client'

import Box from '@mui/material/Box'
import {PropsWithChildren} from "react"
import {Typography} from '@mui/material';

export default function SectionBox(props: PropsWithChildren<{ id: string, title?: string }>) {
    return (
        <section id={props.id + '-section'}>
            <Box sx={{width: '100%', marginBottom: "40px"}}>
                {props.title && (<Typography variant='h3'>{props.title}</Typography>)}
                <Box sx={{width: '100%'}}>
                    {props.children}
                </Box>
            </Box>
        </section>
    )
}