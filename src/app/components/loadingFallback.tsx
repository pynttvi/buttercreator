'use client'
import {Typography} from "@mui/material";
import Box from "@mui/material/Box";
import Image from "next/image";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL
export default function LoadingFallback() {
    return (
        <>
            <Typography variant={'h2'}>Loading...</Typography>
            <Box>
                <Image
                    src={`${BASE_URL === "/" ? "" : BASE_URL}favicon.svg`}
                    alt="Logo"
                    width={800}
                    height={800}
                    priority
                />
            </Box>
        </>
    )
}