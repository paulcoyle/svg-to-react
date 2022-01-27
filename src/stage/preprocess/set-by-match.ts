import { optimize as optimizeSvg } from 'svgo'

import { Config } from '~/src/options'
import { Stage } from '~/src/stage'
import { addAttribute, PseudoAstElement, removeAttribute } from '~/src/svgo'

function instantiatePlugin(config: Config) {
  return {
    name: 'customSetByMatchPlugin',
    type: 'perItem' as const,
    active: true,
    fn: (elem: PseudoAstElement) => {
      config.set.forEach(({ attrs, when }) => {
        const match =
          elem.attributes[when.attr]?.match(new RegExp(when.matches)) ?? null

        if (match !== null) {
          Object.entries(attrs).forEach(([attr, value]) =>
            addAttribute(
              elem,
              attr,
              replacePositionally(match.slice(1), value),
            ),
          )

          if (when.andRemove) {
            removeAttribute(elem, when.attr)
          }
        }
      })

      return elem
    },
  }
}

function replacePositionally(values: string[], target: string): string {
  return values.reduce(
    (out, value, i) => out.replaceAll(`$${i + 1}`, value),
    target,
  )
}

const stage: Stage = async (options, file) => {
  const optimized = optimizeSvg(file.output.content, {
    plugins: [instantiatePlugin(options.config)],
  })
  return { ...file, output: { ...file.output, content: optimized.data } }
}

export default stage
