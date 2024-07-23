'use client'
import {Inter} from "next/font/google";
import "./globals.css";
import React from "react";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL

const inter = Inter({subsets: ["latin"]});

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
            <title>Buttercreator</title>
            <link rel="icon" href={`${BASE_URL === "/" ? "" : BASE_URL}favicon.svg`} sizes="any"/>
        </head>
        <body className={inter.className}>{children}</body>
        </html>
    );
}
