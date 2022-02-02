import { readFile } from 'fs/promises'
import { relative } from 'path'

import { OptionValues } from 'commander'
import merge from 'deepmerge'

import { toAbsolutePath } from '~/src/file'
import * as Log from '~/src/util/log'

export type Options = Readonly<{
  config: Config
  configPath: string
  inputPath: string
  outputPath: string
}>

export type Config = Readonly<{
  preProcess: Readonly<{
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
  convert: Readonly<{
    componentTemplate: string[]
  }>
  finalize: Readonly<{
    indexTemplate: string[]
  }>
}>

const defaultConfig: Config = {
  preProcess: {
    set: [],
    replace: [],
    remove: [],
  },
  convert: {
    componentTemplate: [
      `import { cloneElement, forwardRef } from 'react'`,
      ``,
      `export const <%- componentName %> = forwardRef<SVGSVGElement>(function <%- componentName %>(props, ref) {`,
      `  return cloneElement(<%- content %>, { ...props, ref })`,
      `})`,
      ``,
    ],
  },
  finalize: {
    indexTemplate: [
      `<% components.forEach(function(component) { -%>`,
      `  export { <%- component.componentName %> } from '<%- component.tsRelativeImportPath %>'`,
      `<% }); -%>`,
    ],
  },
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
  }
}

const overwriteMerge = (_dest: unknown[], _source: unknown[]) => _source

async function loadConfig(path: string | undefined): Promise<Config> {
  if (path) {
    const configFile = await readFile(toAbsolutePath(path))
    const config = JSON.parse(configFile.toString())
    Log.info(`Using config file: ${relative(process.cwd(), path)}`)
    return merge(defaultConfig, config, { arrayMerge: overwriteMerge })
  } else {
    return defaultConfig
  }
}
