import { optimize as optimizeSvg } from 'svgo'

import { ProcessStep } from '~/src/process-step'
import { ProcessedFile } from '~/src/processed-file'


export const step: ProcessStep = async (outputFile: ProcessedFile) => {
  const optimized = optimizeSvg(outputFile.content, {
    plugins: [
      { name: 'convertShapeToPath' },
      { name: 'convertPathData' },
      { name: 'convertTransform' },
      { name: 'removeTitle' },
      { name: 'removeAttrs', params: { attrs: ['fill', 'stroke'] } },
    ],
  })

  return { ...outputFile, content: optimized.data }
}
