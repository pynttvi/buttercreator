'use client'
import {Typography} from "@mui/material";
import Box from "@mui/material/Box";

function loadWord() {
    const things = ['Spellcaster', 'Hitter', 'Bard', "Thief", "Mage", "Fighter", "Troll", "Goblin", "Vampire", "Cherub", "Bad", "Good", "Very Bad", "Very Good"];
    return things[Math.floor(Math.random() * things.length)];
}


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