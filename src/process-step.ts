import { InputFile } from './input-file'
import { ProcessedFile } from './processed-file'


export type ProcessStep = (outputFile: ProcessedFile) => Promise<ProcessedFile>

export async function processInputFiles(
  steps: ProcessStep[],
  inputFiles: InputFile[],
): Promise<ProcessedFile[]> {
  return Promise.all(inputFiles.map((f) => processInputFile(steps, f)))
}

async function processInputFile(
  steps: ProcessStep[],
  inputFile: InputFile,
): Promise<ProcessedFile> {
  return steps.reduce(
    async (prevStep, nextStep) => nextStep(await prevStep),
    Promise.resolve({
      originalInputFile: inputFile,
      content: inputFile.content,
    }),
  )
}
