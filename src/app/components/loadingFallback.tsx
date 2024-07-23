'use client'
import {Typography} from "@mui/material";
import Box from "@mui/material/Box";
import {styled} from "@mui/material/styles";

const LoadingImage = styled('img')<{
    width: string;
    height: string;
}>(({theme, width, height}) => ({
    width: width,
    height: height
}));

export default function LoadingFallback() {
    return (
        <>
            <Typography variant={'h2'}>Loading...</Typography>
            <Box>
                <LoadingImage src="/favicon.svg" alt="Logo" width={'70%'} height={'70%'}/>
            </Box>
        </>
    )
}