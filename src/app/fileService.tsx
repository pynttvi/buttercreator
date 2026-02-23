"use client";
import ParserFactory, { CreatorDataType } from "./parserFactory";
// import fs from "fs/promises";
import path from "path";

const DATA_FOLDER = path.join(process.cwd(), "zCreator_data/data");
const USE_LOCAL_FILES = true; // Set to false to fetch from GitHub

export async function getFile(url: string) {
  // if (USE_LOCAL_FILES) {
  //   return await getFileLocal(url);
  // }

  console.log("URL", url);

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.text();
}

export async function getGuildFile(url: string) {
  // if (USE_LOCAL_FILES) {
  //   return await getGuildFileLocal(url);
  // }

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error("Failed to fetch data");
  }

  return res.text();
}

export async function getData(): Promise<Partial<CreatorDataType>> {
  // if (USE_LOCAL_FILES) {
  //   return await getDataLocal();
  // }

  let myData: Partial<CreatorDataType> = {};
  const res = await fetch(
    "https://api.github.com/repos/pynttvi/zCreator_data/contents/data?ref=master",
  );

  if (!res.ok) {
    console.error(res);
    throw new Error("Failed to fetch data");
  }

  const factory = ParserFactory();
  const json = await res.json();

  async function readFiles() {
    for await (const f of await json) {
      // if ((important && NON_GUILD_FILES.includes((f.name))) || (!important && !NON_GUILD_FILES.includes((f.name)))) {
      const process = await factory.createProcessForFile(f);
      const dataField = { key: process.key, data: await process.run() };
      // @ts-ignore
      myData[dataField.key] = dataField.data;
      //}
    }
  }

  await readFiles();
  // readFiles(lessImportantFiles)

  return myData;
}

// export async function getDataLocal(): Promise<Partial<CreatorDataType>> {
//   let myData: Partial<CreatorDataType> = {};

//   const factory = ParserFactory();

//   // Read all filenames in data folder
//   const files = await fs.readdir(DATA_FOLDER);

//   for (const fileName of files) {
//     const filePath = path.join(DATA_FOLDER, fileName);
//     const stat = await fs.stat(filePath);

//     if (!stat.isFile()) continue;

//     // Simulate your previous FileObject structure
//     const fileObject: FileObject = {
//       name: fileName,
//       download_url: fileName, // now just filename
//     };

//     const process = await factory.createProcessForFile(fileObject);
//     const dataField = {
//       key: process.key,
//       data: await process.run(),
//     };

//     // @ts-ignore
//     myData[dataField.key] = dataField.data;
//   }

//   return myData;
// }

// export async function getFileLocal(fileName: string) {
//   const filePath = path.join(DATA_FOLDER, fileName);
//   return fs.readFile(filePath, "utf-8");
// }

// export async function getGuildFileLocal(fileName: string) {
//   const filePath = path.join(DATA_FOLDER, "guilds", fileName);
//   return fs.readFile(filePath, "utf-8");
// }
