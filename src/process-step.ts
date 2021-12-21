import { Config } from './config'
import { InputFile } from './input-file'
import { ProcessedFile } from './processed-file'


export type ProcessStep = (
  config: Config,
  outputFile: ProcessedFile,
) => Promise<ProcessedFile>

export async function processInputFiles(
  steps: ProcessStep[],
  config: Config,
  inputFiles: InputFile[],
): Promise<ProcessedFile[]> {
  return Promise.all(inputFiles.map((f) => processInputFile(steps, config, f)))
}

async function processInputFile(
  steps: ProcessStep[],
  config: Config,
  inputFile: InputFile,
): Promise<ProcessedFile> {
  return steps.reduce(
    async (prevStep, nextStep) => nextStep(config, await prevStep),
    Promise.resolve({
      originalInputFile: inputFile,
      content: inputFile.content,
    }),
  )
}
