import AbilityList from "./components/abilities";
import ClientRoot from "./components/clientRoot";
import Guilds from "./components/guilds";
import RaceList from "./components/races";
import Reinc from "./components/reinc";
import { getData } from "./fileService";
import RootLayout from "./layout";
import { Stack, Typography } from '@mui/material';

export type FileObject = {
  name: string
  download_url: string
}

export default async function Home() {

  const myData = getData()

  return (
    <RootLayout>
      <main className="flex min-h-screen flex-col items-left justify-between p-24">
          <ClientRoot>
            <Stack direction={'column'}>
              <RaceList myData={myData} />
              <Guilds myData={myData} />
              <Stack direction={'row'} spacing={'2'} >
                <AbilityList type={'skills'} myData={myData} />
                <AbilityList type={'spells'} myData={myData}/>
              </Stack>
              <Reinc />
            </Stack>
          </ClientRoot>
      </main>
    </RootLayout>

  );


}
