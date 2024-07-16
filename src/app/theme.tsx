'use client';
import { Space_Mono } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

export const BackhgroundColor = "black"
const space = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const creatorTheme = createTheme({
  typography: {
    fontFamily: space.style.fontFamily,
    h3:{
      gap: 2,
      fontSize: "40px",
      marginBottom: "40px"
    }
  },
  palette: {
    mode: 'dark',
  }
});

export default creatorTheme;