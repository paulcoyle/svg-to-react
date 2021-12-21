import { optimize as optimizeSvg } from 'svgo'

import { ProcessStep } from '~/src/process-step'
import { ProcessedFile } from '~/src/processed-file'
import { PseudoAstElement, renameAttribute } from '~/src/svgo'


const attributeToReactMap: Record<string, string> = {
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
    Object.keys(attributeToReactMap).forEach((attr) =>
      renameAttribute(elem, attr, attributeToReactMap[attr]),
    )

    return elem
  },
}

export const step: ProcessStep = async (outputFile: ProcessedFile) => {
  const optimized = optimizeSvg(outputFile.content, {
    plugins: [reactPropsPlugin],
  })

  return { ...outputFile, content: optimized.data }
}
