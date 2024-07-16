import ClientRoot from "./components/clientRoot";
import {getData} from "./fileService";
import RootLayout from "./layout";
import MainContent from "@/app/components/mainContent";
import {CreatorDataType} from "@/app/parserFactory";

export type FileObject = {
    name: string
    download_url: string
}


export default async function Home() {

    let myData: Promise<Partial<CreatorDataType>> = getData(true)
    return (
        <RootLayout>
            <main className="flex min-h-screen flex-col items-left justify-between p-10">
                <ClientRoot>
                    <MainContent myData={myData}/>
                </ClientRoot>
            </main>
        </RootLayout>

    );


}
