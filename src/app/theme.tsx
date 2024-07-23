'use client';
import {Space_Mono} from 'next/font/google';
import {createTheme} from '@mui/material/styles';
import {GridColDef} from "@mui/x-data-grid";
import {DataGridPropsWithoutDefaultValue} from "@mui/x-data-grid/models/props/DataGridProps";

export const backgroundColor = "black"
export const foregroundColor = "#fff"
const space = Space_Mono({
    weight: ['400', '700'],
    subsets: ['latin'],
    display: 'swap',
});
type PaletteProps = {
    mode: "dark" | "light",
    text: {
        primary: string
    }
}
const dark: PaletteProps = {
    mode: 'dark',
    text: {
        primary: foregroundColor,
    },
}

const creatorTheme = createTheme({

    typography: {
        fontFamily: space.style.fontFamily,
        fontWeightRegular: 550,
        h3: {
            gap: 2,
            fontSize: "40px",
            marginBottom: "40px"
        }
    },
    palette: {
        ...dark,
    },
    mixins: {
        // @ts-ignore
        MuiDataGrid: {
            fontWeightRegular: 550,
        },
    },

});

export default creatorTheme;