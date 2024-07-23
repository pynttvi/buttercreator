'use client'
import {Typography} from "@mui/material";
import Box from "@mui/material/Box";


export default function LoadingFallback() {
    return (
        <>
            <Typography variant={'h2'}>Loading...</Typography>
            <Box>
                <img src="/favicon.svg" alt="Logo" width={'70%'} height={'70%'}/>
            </Box>
        </>
    )
}