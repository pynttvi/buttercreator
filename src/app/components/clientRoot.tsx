'use client'

import {PropsWithChildren} from "react"
import creatorTheme from "../theme"
import {ThemeProvider} from "@emotion/react"
import {LoggingConfig} from "@/app/config/loggingConfig";

LoggingConfig().configure()

export default function ClientRoot(props: PropsWithChildren<{}>) {
    return (
        <ThemeProvider theme={creatorTheme}>
            {props.children}
        </ThemeProvider>
    )
}