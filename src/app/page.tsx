import ClientRoot from "./components/clientRoot";
import {getData} from "./fileService";
import RootLayout from "./layout";
import MainContent from "@/app/components/mainContent";

export type FileObject = {
    name: string
    download_url: string
}


export default async function Home() {

    let myData = getData(true)
    return (
        <RootLayout>
            <main className="flex min-h-screen flex-col items-left justify-between p-24">
                <ClientRoot>
                    <MainContent myData={myData}/>
                </ClientRoot>
            </main>
        </RootLayout>

    );


}
