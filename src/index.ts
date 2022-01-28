#!/usr/bin/env node

import { writeFile } from 'fs/promises'
import { join } from 'path'

import { program } from 'commander'
import pc from 'picocolors'

import { glob } from '~/src/file'
import * as File from '~/src/file'
import * as Options from '~/src/options'
import * as Stage from '~/src/stage'
import stageSvgToTsx from '~/src/stage/convert/svg-to-tsx'
import stageFinalizeReactProps from '~/src/stage/postprocess/finalize-react-props'
import stageFormat from '~/src/stage/postprocess/format'
import stageFromIllustrator from '~/src/stage/preprocess/from-illustrator'
import stageReactProps from '~/src/stage/preprocess/react-props'
import stageReplacement from '~/src/stage/preprocess/replacement'
import stageSetByMatch from '~/src/stage/preprocess/set-by-match'
import stageSvgCommon from '~/src/stage/preprocess/svg-common'
import * as Log from '~/src/util/log'

Log.plain(pc.dim('[svg-to-react]'))

program
  .version('1.1.1')
  .argument('<input-dir>', 'the input directory to read .svg files from')
  .argument('<output-dir>', 'the output directory to write components to')
  .option('-t, --template <path>', 'path to an EJS template for the components')
  .option('-c, --config <path>', 'path to an svg-to-react.json config file')
  .parse()

const cliOptions = program.opts()

const stages: Stage.Stage[] = [
  stageSvgCommon,
  stageFromIllustrator,
  stageSetByMatch,
  stageReplacement,
  stageReactProps,
  stageSvgToTsx,
  stageFinalizeReactProps,
  stageFormat,
]

async function main() {
  try {
    const options = await Options.prepare(
      program.args[0],
      program.args[1],
      cliOptions,
    )
    const filePaths = await glob(`${options.inputPath}/*.svg`)
    const processFiles = await File.fromPaths(options, filePaths)
    const processedFiles = await Stage.runStages(stages, options, processFiles)
    const writtenFiles = await Promise.all(
      processedFiles.map(({ output }) =>
        writeFile(
          join(options.outputPath, `${output.name}.tsx`),
          output.content,
        ),
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
