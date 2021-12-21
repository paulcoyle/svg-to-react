import { optimize as optimizeSvg } from 'svgo'

import { Config } from '~/src/config'
import { ProcessStep } from '~/src/process-step'
import { ProcessedFile } from '~/src/processed-file'


export const step: ProcessStep = async (
  config: Config,
  outputFile: ProcessedFile,
) => {
  const optimized = optimizeSvg(outputFile.content, {
    plugins: [
      { name: 'convertShapeToPath' },
      { name: 'convertPathData' },
      { name: 'convertTransform' },
      { name: 'removeTitle' },
      { name: 'removeAttrs', params: { attrs: config.removeAttrs } },
    ],
  })

  return { ...outputFile, content: optimized.data }
}
