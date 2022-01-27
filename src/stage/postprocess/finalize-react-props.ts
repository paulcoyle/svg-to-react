import { Stage } from '~/src/stage'

const attrMatcher = /([a-zA-Z]+)="react::([^"]+)"/g
const matcherActions = [(c: string) => c.replace(attrMatcher, '$1={$2}')]

const stage: Stage = async (_, file) => {
  return {
    ...file,
    output: {
      ...file.output,
      content: matcherActions.reduce((c, a) => a(c), file.output.content),
    },
  }
}

export default stage
