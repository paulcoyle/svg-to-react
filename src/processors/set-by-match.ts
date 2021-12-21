import { optimize as optimizeSvg } from 'svgo'

import { Config } from '~/src/config'
import { ProcessStep } from '~/src/process-step'
import { ProcessedFile } from '~/src/processed-file'
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

export const step: ProcessStep = async (
  config: Config,
  outputFile: ProcessedFile,
) => {
  const optimized = optimizeSvg(outputFile.content, {
    plugins: [instantiatePlugin(config)],
  })
  return { ...outputFile, content: optimized.data }
}
