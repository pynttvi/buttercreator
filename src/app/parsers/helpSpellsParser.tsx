import { FileObject } from "../page"
import { getFile } from "../fileService";
import { ParserProcess } from "../parserFactory";

export type SpellHelp = {
  name: string
  text: string
}

export default async function HelpSpellsParser(data: FileObject): Promise<ParserProcess> {

  const spellHelps: SpellHelp[] = []
  let spell: string = ""
  let text: string = ""

  function parseLine(line: string) {
    if (line.includes("Help on spell:")) {
      if (spell !== "") {
        spellHelps.push({ name: spell, text: text })
      }
      spell = line.split("Help on spell:")?.at(1)?.trim() || ""
      text = ""
    }

    if (line.includes("------")) {
      return
    }

    if (spell !== "") {
      text += "\n" + line
    }

  }

  return {
    key: 'helpSpells',
    run: async (): Promise<SpellHelp[]> => {
      const fileContent = await getFile(data.download_url)
      const lines = fileContent.split("\n")
      lines.forEach((line: string) => {
        parseLine(line)
      });

      return spellHelps
    }
  }

}
