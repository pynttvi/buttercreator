'use client'
import ClientRoot from "./components/clientRoot";
import {getData} from "./fileService";
import RootLayout from "./layout";
import MainContent from "@/app/components/mainContent";
import {useEffect, useState} from "react";
import {CreatorDataType} from "@/app/parserFactory";
import LoadingFallback from "@/app/components/loadingFallback";

export type FileObject = {
    name: string
    download_url: string
}

export default function Home() {
    const [data, setData] = useState<Promise<Partial<CreatorDataType>> | null>(null)

    useEffect(() => {
        setData(getData())
    }, []);


    if (!data) {
        return (
            <RootLayout>
                <main className="flex min-h-screen flex-col items-left justify-between p-10">
                    <ClientRoot>
                        <LoadingFallback/>
                    </ClientRoot>
                </main>
            </RootLayout>

        );
    }

    return (
        <RootLayout>
            <main className="flex min-h-screen flex-col items-left justify-between p-10">
                <ClientRoot>
                    <MainContent myData={data}/>
                </ClientRoot>
            </main>
        </RootLayout>

    );


}
