import { optimize as optimizeSvg } from 'svgo'

import { Stage } from '~/src/stage'
import { attrToReact } from '~/src/util/react'
import { PseudoAstElement, renameAttribute } from '~/src/util/svgo'

const specialAttributes: Record<string, string> = {
  class: 'className',
}

const reactPropsPlugin = {
  name: 'customReactPropsPlugin',
  type: 'perItem' as const,
  active: true,
  fn: (elem: PseudoAstElement) => {
    Object.entries(specialAttributes).forEach(([attr, reactAttr]) =>
      renameAttribute(elem, attr, reactAttr),
    )
    Object.entries(elem.attributes).forEach(([attr]) =>
      renameAttribute(elem, attr, attrToReact(attr)),
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
