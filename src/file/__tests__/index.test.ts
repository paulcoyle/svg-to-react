import { fromPaths, ProcessFile } from '..'

import { basicOptions } from '~/src/test'

jest.mock('fs/promises', () => {
  const module = jest.requireActual('fs/promises')
  return {
    ...module,
    readFile(path: string) {
      return Promise.resolve(`MOCK ${path}`)
    },
  }
})

describe('file module', () => {
  describe('fromPaths', () => {
    let processFiles: ProcessFile[]

    describe('the input file representation', () => {
      beforeEach(async () => {
        processFiles = await fromPaths(basicOptions, [
          '/full/path/one/alpha.svg',
          '/full/path/two/beta.svg',
        ])
      })

      it('should set the file path', async () => {
        expect(processFiles.map(({ input }) => input.path)).toEqual([
          '/full/path/one/alpha.svg',
          '/full/path/two/beta.svg',
        ])
      })

      it('should set the file name', async () => {
        expect(processFiles.map(({ input }) => input.name)).toEqual([
          'alpha',
          'beta',
        ])
      })

      it('should set the file contents', async () => {
        expect(processFiles.map(({ input }) => input.content)).toEqual([
          'MOCK /full/path/one/alpha.svg',
          'MOCK /full/path/two/beta.svg',
        ])
      })
    })

    describe('the output file representation', () => {
      beforeEach(async () => {
        processFiles = await fromPaths(basicOptions, [
          '/full/path/one/alpha-one.svg',
          '/full/path/two/beta-twoThree.svg',
          '/full/path/one/DeltaFour.svg',
          '/full/path/two/Gamma-Five-Six.svg',
        ])
      })

      it('should set the full output path', () => {
        expect(processFiles.map(({ output }) => output.path)).toEqual([
          `${basicOptions.outputPath}/alpha-one.tsx`,
          `${basicOptions.outputPath}/beta-twoThree.tsx`,
          `${basicOptions.outputPath}/DeltaFour.tsx`,
          `${basicOptions.outputPath}/Gamma-Five-Six.tsx`,
        ])
      })

      it('should set the relative import path for TypeScript', () => {
        expect(
          processFiles.map(({ output }) => output.tsRelativeImportPath),
        ).toEqual([
          `./alpha-one`,
          `./beta-twoThree`,
          `./DeltaFour`,
          `./Gamma-Five-Six`,
        ])
      })

      it('should set the name as the input file name', async () => {
        expect(processFiles.map(({ output }) => output.name)).toEqual([
          'alpha-one',
          'beta-twoThree',
          'DeltaFour',
          'Gamma-Five-Six',
        ])
      })

      it('should set the contents as the input file contents', async () => {
        expect(processFiles.map(({ output }) => output.content)).toEqual([
          'MOCK /full/path/one/alpha-one.svg',
          'MOCK /full/path/two/beta-twoThree.svg',
          'MOCK /full/path/one/DeltaFour.svg',
          'MOCK /full/path/two/Gamma-Five-Six.svg',
        ])
      })

      it('should set the component name as a CamelCase version of the file name', async () => {
        expect(processFiles.map(({ output }) => output.componentName)).toEqual([
          'AlphaOne',
          'BetaTwoThree',
          'DeltaFour',
          'GammaFiveSix',
        ])
      })
    })
  })
})
