import { writeFile } from 'fs/promises'
import { join } from 'path'

import { compile } from 'ejs'
import { format, resolveConfig } from 'prettier'

import { ProcessFile } from '~/src/file'
import { Options } from '~/src/options'

export type Finalizer = (
  options: Options,
  files: ProcessFile[],
) => Promise<ProcessFile[]>

export async function runFinalizers(
  finalizers: Finalizer[],
  options: Options,
  files: ProcessFile[],
) {
  finalizers.reduce(
    async (fs, finalizer) => finalizer(options, await fs),
    Promise.resolve(files),
  )
}

export const finalizerWriteFiles: Finalizer = async (_, files) => {
  await Promise.all(
    files.map(({ output }) => writeFile(output.path, output.content)),
  )
  return Promise.resolve(files)
}

export const finalizerCreateIndex: Finalizer = async (options, files) => {
  const config = (await resolveConfig(options.outputPath)) ?? {}
  const template = compile(options.config.finalize.indexTemplate.join('\n'))
  const rawContent = template({
    components: files.map(({ output }) => output),
  })
  await writeFile(
    join(`${options.outputPath}`, 'index.ts'),
    format(rawContent, { ...config, parser: 'typescript' }),
  )
  return Promise.resolve(files)
}
