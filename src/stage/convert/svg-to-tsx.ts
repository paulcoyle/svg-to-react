import { compile, TemplateFunction } from 'ejs'

import { Options } from '~/src/options'
import { Stage } from '~/src/stage'

let cachedTemplate: TemplateFunction

const stage: Stage = async (options, file) => {
  const template = getTemplate(options)

  return {
    ...file,
    output: {
      ...file.output,
      content: template(file.output),
    },
  }
}

export default stage

function getTemplate(options: Options) {
  if (!cachedTemplate) {
    cachedTemplate = compile(
      options.config.convert.componentTemplate.join('\n'),
    )
  }

  return cachedTemplate
}
