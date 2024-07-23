import {FileObject} from "../page"
import {getFile} from "../fileService";
import {ParserProcess} from "../parserFactory";

export type QpCost = Array<number>

export default async function QpCostParser(data: FileObject): Promise<ParserProcess> {

  const qpCosts: QpCost = []

  function parseLine(line: string) {
    try {
      const value = parseInt(line)
      if (value) {
        qpCosts.push(value)
      }
    } catch (error) {
      console.error("Error reading qp cost line")
    }

  }

  return {
    key: 'qpCost',
    run: async (): Promise<QpCost> => {
      const fileContent = await getFile(data.download_url)
      const lines = fileContent.split("\n")
      lines.forEach((line: string) => {
        parseLine(line)
      });

      return qpCosts
    }
  }

}
