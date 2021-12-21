#!/usr/bin/env node

import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

import { program } from 'commander'
import pc from 'picocolors'

import { globFiles } from './files'
import { fromPaths } from './input-file'
import * as Log from './log'
import { prepareFromProcessedFiles } from './output-file'
import { toAbsolutePath } from './paths'
import { processInputFiles, ProcessStep } from './process-step'
import { step as fromIllustratorStep } from './processors/from-illustrator'
import { step as reactPropsStep } from './processors/react-props'
import { step as svgCommonStep } from './processors/svg-common'
import { defaultTemplate, generateComponentsFromTemplate } from './template'


program
  .version('1.0.0')
  .argument('<input-dir>', 'the input directory to read .svg files from')
  .argument('<output-dir>', 'the output directory to write components to')
  .option('-t, --template <path>', 'path to an EJS template for the components')
  .parse()

const inputDir = toAbsolutePath(program.args[0])
const outputDir = toAbsolutePath(program.args[1])
const options = program.opts()
const processSteps: ProcessStep[] = [
  svgCommonStep,
  fromIllustratorStep,
  reactPropsStep,
]

async function readTemplateFile(
  path: string | undefined,
  defaultContent: string,
): Promise<string> {
  if (path) {
    const templateFile = await readFile(toAbsolutePath(path))
    return templateFile.toString()
  } else {
    Log.warn('No template specified, using default.')
    return defaultContent
  }
}

async function main() {
  Log.plain(pc.dim('[svg-to-react]'))

  try {
    const templateSource = await readTemplateFile(
      options.template,
      defaultTemplate,
    )
    const filePaths = await globFiles(`${inputDir}/*.svg`)

    Log.info(`Found ${pc.bold(filePaths.length)} files.`)

    const inputFiles = await fromPaths(filePaths)
    const processedFiles = await processInputFiles(processSteps, inputFiles)
    const outputFiles = await prepareFromProcessedFiles(processedFiles)
    const writableFiles = await generateComponentsFromTemplate(
      templateSource,
      outputFiles,
    )
    const writtenFiles = await Promise.all(
      writableFiles.map(({ fileExt, fileName, content }) =>
        writeFile(join(outputDir, `${fileName}.${fileExt}`), content),
      ),
    )
    Log.success(`Wrote ${pc.bold(writtenFiles.length)} files.`)
  } catch (e) {
    if (e instanceof Error) {
      Log.error(e.message)
    } else {
      Log.error(`Unknown error.`)
    }
    process.exit(1)
  }
}

main()
