import { ProcessedFile } from './processed-file'
import { capitalize, kebabToCamel } from './strings'


export type OutputFile = ProcessedFile & {
  componentName: string
  fileName: string
  fileExt: string
}

export async function prepareFromProcessedFiles(
  processedFiles: ProcessedFile[],
): Promise<OutputFile[]> {
  return Promise.all(
    processedFiles.map(async (f) => {
      const name = generateComponentAndFileName(f)

      return {
        ...f,
        componentName: name,
        fileName: name,
        fileExt: 'tsx',
      }
    }),
  )
}

function generateComponentAndFileName(processedFile: ProcessedFile): string {
  return capitalize(kebabToCamel(processedFile.originalInputFile.fileName))
}
