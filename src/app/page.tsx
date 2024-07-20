import ClientRoot from "./components/clientRoot";
import {getData} from "./fileService";
import RootLayout from "./layout";
import MainContent from "@/app/components/mainContent";
import {CreatorDataType} from "@/app/parserFactory";

export type FileObject = {
    name: string
    download_url: string
}
export async function loadWord() {
    const things = ['Spellcaster', 'Hitter', 'Bard', "Thief", "Mage", "Fighter", "Troll", "Goblin", "Vampire", "Cherub", "Bad", "Good", "Very Bad", "Very Good"];
    return things[Math.floor(Math.random() * things.length)];
}

export default async function Home() {

    let myData: Promise<Partial<CreatorDataType>> = getData(true)
    return (
        <RootLayout>
            <main className="flex min-h-screen flex-col items-left justify-between p-10">
                <ClientRoot>
                    <MainContent title={loadWord()} myData={myData}/>
                </ClientRoot>
            </main>
        </RootLayout>

    );


}
