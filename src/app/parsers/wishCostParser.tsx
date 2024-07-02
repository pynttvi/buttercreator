import { FileObject } from "../page"
import { getFile } from "../fileService";
import { ParserProcess } from "../parserFactory";

export type WishCost = Array<number>

export default async function WishCostParser(data: FileObject): Promise<ParserProcess> {

  const wishCosts: WishCost = []

  function parseLine(line: string) {
    try {
      const value = parseInt(line)
      if (value) {
        wishCosts.push(value)
      }
    } catch (error) {
      console.error("Error reading wish cost line")
    }

  }

  return {
    key: 'wishCosts',
    run: async (): Promise<WishCost> => {
      const fileContent = await getFile(data.download_url)
      const lines = fileContent.split("\n")
      lines.forEach((line: string) => {
        parseLine(line)
      });

      return wishCosts
    }
  }

}
