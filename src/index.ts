#!/usr/bin/env node

import { program } from 'commander'
import pc from 'picocolors'

import { glob } from '~/src/file'
import * as File from '~/src/file'
import * as Finalizer from '~/src/finalizer'
import * as Options from '~/src/options'
import * as Stage from '~/src/stage'
import stageSvgToTsx from '~/src/stage/convert/svg-to-tsx'
import stageFinalizeReactProps from '~/src/stage/postprocess/finalize-react-props'
import stageFormat from '~/src/stage/postprocess/format'
import stageFromIllustrator from '~/src/stage/preprocess/from-illustrator'
import stageReactProps from '~/src/stage/preprocess/react-props'
import stageReplacement from '~/src/stage/preprocess/replacement'
import stageSetByMatch from '~/src/stage/preprocess/set-by-match'
import stageStyleAttrs from '~/src/stage/preprocess/style-attrs'
import stageSvgCommon from '~/src/stage/preprocess/svg-common'
import * as Log from '~/src/util/log'

Log.plain(pc.dim('[svg-to-react]'))

program
  .version('1.4.3')
  .argument('<input-dir>', 'the input directory to read .svg files from')
  .argument('<output-dir>', 'the output directory to write components to')
  .option('-c, --config <path>', 'path to an svg-to-react.json config file')
  .parse()

const cliOptions = program.opts()

const stages: Stage.Stage[] = [
  stageSvgCommon,
  stageFromIllustrator,
  stageSetByMatch,
  stageReplacement,
  stageReactProps,
  stageStyleAttrs,
  stageSvgToTsx,
  stageFinalizeReactProps,
  stageFormat,
]

const finalizers: Finalizer.Finalizer[] = [
  Finalizer.finalizerWriteFiles,
  Finalizer.finalizerCreateIndex,
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

    const stagesToRun = stages.filter((stage) => {
      if (stage === stageFromIllustrator) {
        return options.config.preProcess.fromIllustrator
      } else {
        return true
      }
    })

    const processedFiles = await Stage.runStages(
      stagesToRun,
      options,
      processFiles,
    )

    Finalizer.runFinalizers(finalizers, options, processedFiles)

    Log.success(
      `Wrote ${pc.bold(processedFiles.length)} component files and ${pc.bold(
        1,
      )} index file.`,
    )
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
