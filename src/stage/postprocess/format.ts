import { format, resolveConfig } from 'prettier'

import { Stage } from '~/src/stage'

const stage: Stage = async (options, file) => {
  const config = (await resolveConfig(options.outputPath)) ?? {}
  return {
    ...file,
    output: {
      ...file.output,
      content: format(file.output.content, { ...config, parser: 'typescript' }),
    },
  }
}

export default stage
