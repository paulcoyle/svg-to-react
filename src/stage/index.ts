import { ProcessFile } from '~/src/file'
import { Options } from '~/src/options'

export type Stage = (
  options: Options,
  outputFile: ProcessFile,
) => Promise<ProcessFile>

export async function runStages(
  stages: Stage[],
  options: Options,
  files: ProcessFile[],
): Promise<ProcessFile[]> {
  return Promise.all(files.map((f) => runStagesOnFile(stages, options, f)))
}

async function runStagesOnFile(
  stages: Stage[],
  options: Options,
  file: ProcessFile,
): Promise<ProcessFile> {
  return stages.reduce(
    async (prevStep, nextStep) => nextStep(options, await prevStep),
    Promise.resolve({ ...file }),
  )
}
