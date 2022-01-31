import { readFile } from 'fs/promises'

import { compile, TemplateFunction } from 'ejs'

import { toAbsolutePath } from '~/src/file'
import { Stage } from '~/src/stage'
import { capitalize, kebabToCamel } from '~/src/util/strings'

const templateCache = new Map<string, TemplateFunction>()

const stage: Stage = async (options, file) => {
  const template = await loadTemplate(options.templatePath)
  return {
    ...file,
    output: {
      ...file.output,
      content: template({
        componentName: makeComponentName(file.output.name),
        content: file.output.content,
      }),
    },
  }
}

export default stage

const defaultTemplate = compile(`
import { cloneElement, forwardRef } from 'react'

export const <%- componentName %> = React.forwardRef<SVGSVGElement>(function <%- componentName %>(props, ref) {
  return cloneElement(<svg></svg>, { ...props, ref })
})

`)

async function loadTemplate(
  templatePath: string | undefined,
): Promise<TemplateFunction> {
  if (templatePath) {
    const maybeCached = templateCache.get(templatePath)

    if (maybeCached) {
      return maybeCached
    } else {
      const templateFile = await readFile(toAbsolutePath(templatePath))
      const template = compile(templateFile.toString())
      templateCache.set(templatePath, template)
      return template
    }
  } else {
    return defaultTemplate
  }
}

function makeComponentName(inputFileName: string): string {
  return capitalize(kebabToCamel(inputFileName))
}
