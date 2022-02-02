import { readFile } from 'fs/promises'
import { join } from 'path'

import { glob as globLib } from 'glob'

import { getFileName } from './paths'

import { Options } from '~/src/options'
import { capitalize, kebabToCamel } from '~/src/util/strings'

export { toAbsolutePath } from './paths'

export type File = {
  path: string
  name: string
  content: string
}

export type InputFile = File

export type OutputFile = File & {
  componentName: string
  tsRelativeImportPath: string
}

export type ProcessFile = {
  readonly input: Readonly<InputFile>
  output: OutputFile
}

export async function fromPaths(
  options: Options,
  filePaths: string[],
): Promise<ProcessFile[]> {
  return Promise.all(
    filePaths.map(async (path) => {
      const content = (await readFile(path)).toString()
      const name = getFileName(path)
      const fullPath = join(options.outputPath, `${name}.tsx`)
      const tsRelativeImportPath = `./${name}`

      return {
        input: { path, name, content },
        output: {
          componentName: capitalize(kebabToCamel(name)),
          content,
          name,
          path: fullPath,
          tsRelativeImportPath,
        },
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
