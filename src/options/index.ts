import { readFile } from 'fs/promises'

import { OptionValues } from 'commander'

import { toAbsolutePath } from '~/src/file'
import * as Log from '~/src/util/log'

export type Options = Readonly<{
  config: Config
  configPath: string
  inputPath: string
  outputPath: string
  templatePath: string
}>

export type Config = Readonly<{
  set: Readonly<{
    attrs: Record<string, string>
    when?: Readonly<{
      attr: string
      matches: string
      andRemove?: boolean
    }>
  }>[]
  replace: [string, string][]
  remove: string[]
}>

const defaultConfig: Config = {
  set: [],
  replace: [],
  remove: [],
}

export async function prepare(
  inputPath: string,
  outputPath: string,
  options: OptionValues,
): Promise<Options> {
  const config = await loadConfig(options.config)

  return {
    config,
    configPath: options.config,
    inputPath,
    outputPath,
    templatePath: options.template,
  }
}

async function loadConfig(path: string | undefined): Promise<Config> {
  if (path) {
    const configFile = await readFile(toAbsolutePath(path))
    const config = JSON.parse(configFile.toString())
    Log.info(`Using config file: ${path}`)
    return Object.assign({}, defaultConfig, config) as Config
  } else {
    return defaultConfig
  }
}
