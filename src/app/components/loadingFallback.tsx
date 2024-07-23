'use client'
import {Typography} from "@mui/material";
import Box from "@mui/material/Box";
import Image from "next/image";


export default function LoadingFallback() {
    return (
        <>
            <Typography variant={'h2'}>Loading...</Typography>
            <Box>
                <Image src="/favicon.svg" alt="Logo" style={{
                    width: '70%',
                    height: '70%'
                }}/>
            </Box>
        </>
    )
}