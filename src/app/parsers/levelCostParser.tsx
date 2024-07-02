import { FileObject } from "../page"
import { getFile } from "../fileService";
import { ParserProcess } from "../parserFactory";

export type LevelCost = Array<number>

export default async function LevelCostParser(data: FileObject): Promise<ParserProcess> {

  const levelCosts: LevelCost = []

  function parseLine(line: string) {
    try {
      const value = parseInt(line)
      if (value) {
        levelCosts.push(value)
      }
    } catch (error) {
      console.error("Error reading level cost line")
    }

  }

  return {
    key: 'levelCosts',
    run: async (): Promise<LevelCost> => {
      const fileContent = await getFile(data.download_url)
      const lines = fileContent.split("\n")
      lines.forEach((line: string) => {
        parseLine(line)
      });

      return levelCosts
    }
  }

}
