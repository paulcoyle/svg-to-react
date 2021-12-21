import { compile } from 'ejs'

import { OutputFile } from './output-file'


export async function generateComponentsFromTemplate(
  templateSource: string,
  outputFiles: OutputFile[],
): Promise<OutputFile[]> {
  const template = compile(templateSource)
  return Promise.all(
    outputFiles.map((o) => ({
      ...o,
      content: template(o),
    })),
  )
}

export const defaultTemplate = `
import { cloneElement, SVGProps } from 'react'

function <%- componentName %>(props: SVGProps<SVGSVGElement>) {
  return cloneElement(<%- content %>, props)
}

`
