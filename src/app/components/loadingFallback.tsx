'use client'
import {Typography} from "@mui/material";
import Box from "@mui/material/Box";
import Image from "next/image";

export default function LoadingFallback() {
    return (
        <>
            <Typography variant={'h2'}>Loading...</Typography>
            <Box>
                <Image
                    src={`/favicon.svg`}
                    alt="Vercel Logo"
                    width={800}
                    height={800}
                    priority
                />
            </Box>
        </>
    )
}