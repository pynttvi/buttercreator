'use client'

import { PropsWithChildren } from "react"
import RootLayout from "../layout"
import creatorTheme from "../theme"
import { ThemeProvider } from "@emotion/react"
import { ReincContextProvider } from "../contexts/reincContext"

export default function ClientRoot(props: PropsWithChildren<{}>) {
    return (
        <ThemeProvider theme={creatorTheme}>
            <ReincContextProvider>
                {props.children}
            </ReincContextProvider>
        </ThemeProvider>
    )
}