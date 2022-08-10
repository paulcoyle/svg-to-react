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
    fromIllustrator: boolean
    /**
     * Used to set attributes on elements.
     */
    set: Readonly<{
      /**
       * A key-value map of attributes to set when the `when` conditions are
       * met.
       */
      attrs: Record<string, string>
      /**
       * The condition under which the values in `attrs` should be applied.
       */
      when?: Readonly<{
        /**
         * The name of the attribute whose value to check.
         */
        attr: string
        /**
         * A regular expression which constitutes a successful match against
         * the attribute's value.
         */
        matches: string
        /**
         * When true, removes this attribute when it matches.
         */
        remove?: boolean
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
    fromIllustrator: true,
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
