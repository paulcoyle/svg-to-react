import { readFile } from 'fs/promises'

import { getFileName } from './paths'


export type InputFile = {
  filePath: string
  fileName: string
  content: string
}

export async function fromPaths(filePaths: string[]): Promise<InputFile[]> {
  return Promise.all(
    filePaths.map(async (filePath) => {
      const content = await readFile(filePath)
      return {
        filePath,
        fileName: getFileName(filePath),
        content: content.toString(),
      }
    }),
  )
}
