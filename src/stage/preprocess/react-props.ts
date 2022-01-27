import { optimize as optimizeSvg } from 'svgo'

import { Stage } from '~/src/stage'
import { PseudoAstElement, renameAttribute } from '~/src/svgo'

const attributeToReactMap: Record<string, string> = {
  class: 'className',
  'clip-path': 'clipPath',
  'stop-color': 'stopColor',
  'stroke-dasharray': 'strokeDasharray',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-miterlimit': 'strokeMiterlimit',
  'stroke-width': 'strokeWidth',
  'xmlns:xlink': 'xmlnsXlink',
}

const reactPropsPlugin = {
  name: 'customReactPropsPlugin',
  type: 'perItem' as const,
  active: true,
  fn: (elem: PseudoAstElement) => {
    // Handle common attributes HTML -> React.
    // Eventually a kebab-case to headlessCamelCase general converter would be
    // worth implementing (along with stapled:case).
    Object.entries(attributeToReactMap).forEach(([attr, reactAttr]) =>
      renameAttribute(elem, attr, reactAttr),
    )
    return elem
  },
}

const stage: Stage = async (_, file) => {
  const optimized = optimizeSvg(file.output.content, {
    plugins: [reactPropsPlugin],
  })
  return { ...file, output: { ...file.output, content: optimized.data } }
}

export default stage
