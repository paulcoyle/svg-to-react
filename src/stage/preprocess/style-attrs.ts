import toStyle from 'css-to-style'
import { optimize as optimizeSvg } from 'svgo'

import { Stage } from '~/src/stage'
import { PseudoAstElement, replaceAttribute } from '~/src/util/svgo'

/**
 * Very quick and naïve implementation; does not handle arrays but we won't need
 * to when working with style objects.
 */
function objectToString(o: object | Record<string, unknown>): string {
  const content = Object.entries(o)
    .map(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        return [key, objectToString(value)]
      } else if (typeof value === 'string') {
        return [key, `'${value}'`]
      } else {
        return [key, value]
      }
    })
    .map(([key, value]) => `${key}: ${value}`)

  return `{ ${content.join(', ')} }`
}

const styleAttrsPlugin = {
  name: 'customStyleAttrsPlugin',
  type: 'perItem' as const,
  active: true,
  fn: (elem: PseudoAstElement) => {
    replaceAttribute(
      elem,
      'style',
      (value) => `react::(${objectToString(toStyle(value ?? ''))})`,
    )
    return elem
  },
}

const stage: Stage = async (_, file) => {
  const optimized = optimizeSvg(file.output.content, {
    plugins: [styleAttrsPlugin],
  })
  return { ...file, output: { ...file.output, content: optimized.data } }
}

export default stage
