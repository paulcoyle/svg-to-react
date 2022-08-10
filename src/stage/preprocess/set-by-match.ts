import { optimize as optimizeSvg } from 'svgo'

import { Config } from '~/src/options'
import { Stage } from '~/src/stage'
import {
  addAttribute,
  PseudoAstElement,
  removeAttribute,
} from '~/src/util/svgo'

function instantiatePlugin(config: Config) {
  return {
    name: 'customSetByMatchPlugin',
    type: 'perItem' as const,
    active: true,
    fn: (elem: PseudoAstElement) => {
      config.preProcess.set.forEach(({ attrs, when }) => {
        let replacements: Record<string, string> = {}

        if (when) {
          const match =
            elem.attributes[when.attr]?.match(new RegExp(when.matches)) || null

          if (match !== null) {
            Object.entries(attrs).forEach(
              ([attr, value]) =>
                (replacements[attr] = replacePositionally(
                  match.slice(1),
                  value,
                )),
            )

            if (when.remove) {
              removeAttribute(elem, when.attr)
            }
          }
        } else {
          replacements = attrs
        }

        Object.entries(replacements).forEach(([attr, value]) =>
          addAttribute(elem, attr, value),
        )
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
