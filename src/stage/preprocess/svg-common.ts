import { optimize as optimizeSvg } from 'svgo'

import { Stage } from '~/src/stage'

const stage: Stage = async (options, file) => {
  const optimized = optimizeSvg(file.output.content, {
    plugins: [
      { name: 'convertShapeToPath' },
      { name: 'convertPathData' },
      { name: 'convertTransform' },
      { name: 'removeTitle' },
      { name: 'removeAttrs', params: { attrs: options.config.remove } },
    ],
  })

  return { ...file, output: { ...file.output, content: optimized.data } }
}

export default stage
