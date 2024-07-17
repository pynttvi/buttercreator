import { FileObject } from "../page"
import { getFile } from "../fileService";
import { ParserProcess } from "../parserFactory";

export type RaceHelp = {
  name: string
  text: string
}

export default async function HelpRacesParser(data: FileObject): Promise<ParserProcess> {

  const raceHelps: RaceHelp[] = []
  let race: string = ""
  let text: string = ""

  function parseLine(line: string) {
    if (line.startsWith("Help race")) {
      if (race !== "") {
        raceHelps.push({ name: race, text: text })
      }
      race = line.split("Help race ")?.at(1)?.trim() || ""
      text = ""
    }

    if (line.startsWith("------")) {
      return
    }

    if (race !== "" && !line.startsWith("Help race")) {
      text += "\n" + line
    }

  }

  return {
    key: 'helpRace',
    run: async (): Promise<RaceHelp[]> => {
      const fileContent = await getFile(data.download_url)
      const lines = fileContent.split("\n")
      lines.forEach((line: string) => {
        parseLine(line)
      });

      return raceHelps
    }
  }

}
