import { ProcessStep } from '~/src/process-step'


const attrMatcher = /([a-zA-Z]+)="react::([^"]+)"/g
const matcherActions = [(c: string) => c.replace(attrMatcher, '$1={$2}')]

export const step: ProcessStep = async (_, outputFile) => {
  return {
    ...outputFile,
    content: matcherActions.reduce((c, a) => a(c), outputFile.content),
  }
}
