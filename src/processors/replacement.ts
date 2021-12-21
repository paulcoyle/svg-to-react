import { Config } from '~/src/config'
import { ProcessStep } from '~/src/process-step'
import { ProcessedFile } from '~/src/processed-file'


export const step: ProcessStep = async (
  config: Config,
  outputFile: ProcessedFile,
) => {
  return config.replace.reduce(
    (out, replacement) => ({
      ...out,
      content: out.content.replaceAll(...replacement),
    }),
    outputFile,
  )
}
