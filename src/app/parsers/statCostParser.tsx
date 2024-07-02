import { FileObject } from "../page"
import { getFile } from "../fileService";
import { ParserProcess } from "../parserFactory";

export type StatCost = Array<number>

export default async function StatCostParser(data: FileObject): Promise<ParserProcess> {

  const statCosts: StatCost = []

  function parseLine(line: string) {
    try {
      const value = parseInt(line)
      if (value) {
        statCosts.push(value)
      }
    } catch (error) {
      console.error("Error reading stat cost line")
    }

  }

  return {
    key: 'statCost',
    run: async (): Promise<StatCost> => {
      const fileContent = await getFile(data.download_url)
      const lines = fileContent.split("\n")
      lines.forEach((line: string) => {
        parseLine(line)
      });

      return statCosts
    }
  }

}
