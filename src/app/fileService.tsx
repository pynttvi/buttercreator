import { FileObject } from "./page";
import ParserFactory from "./parserFactory";

export async function getFile(url: string) {

  console.log("URL", url)

  const res = await fetch(url)

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.text()
}

export async function getData(): Promise<Map<string, any>> {

  let myData = new Map<string, any>();
  const res = await fetch('https://api.github.com/repos/juuussi/zCreator_data/contents/data?ref=master');

  if (!res.ok) {
    throw new Error('Failed to fetch data');
  }

  const factory = ParserFactory();
  const json = res.json();
/*   const lessImportantFiles: FileObject[] = []
  const importantFiles = json.filter((file: FileObject) => {
    if (NON_GUILD_FILES.includes((file.name))) {
      return true
    } else {
      lessImportantFiles.push(file)
      return false
    }
  }) */

  async function readFiles(fileList: Promise<FileObject[]>) {
    for await (const f of await json) {
      const process = await factory.createProcessForFile(f);
      const dataField = { key: process.key, data: await process.run() };
      myData.set(dataField.key, dataField.data);
    }
  }

  await readFiles(json)
 // readFiles(lessImportantFiles)

  return myData;
}

