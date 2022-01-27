import { readFile } from 'fs/promises'

import { glob as globLib } from 'glob'

import { getFileName } from './paths'

import { Options } from '~/src/options'

export { toAbsolutePath } from './paths'

export type File = {
  path: string
  name: string
  content: string
}

export type ProcessFile = {
  readonly input: Readonly<File>
  output: File
}

export async function fromPaths(
  _: Options,
  filePaths: string[],
): Promise<ProcessFile[]> {
  return Promise.all(
    filePaths.map(async (path) => {
      const content = (await readFile(path)).toString()
      const name = getFileName(path)

      return {
        input: { path, name, content },
        output: { path: '', name, content },
      }
    }),
  )
}

export async function glob(pattern: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    globLib(pattern, (err, matches) => {
      if (err) {
        reject(err)
      } else {
        resolve(matches)
      }
    })
  })
}
