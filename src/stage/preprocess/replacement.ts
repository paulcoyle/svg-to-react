import { Stage } from '~/src/stage'

const stage: Stage = async (options, file) => {
  return {
    ...file,
    output: {
      ...file.output,
      content: options.config.preProcess.replace.reduce(
        (out, replacement) => out.replaceAll(...replacement),
        file.output.content,
      ),
    },
  }
}

export default stage
