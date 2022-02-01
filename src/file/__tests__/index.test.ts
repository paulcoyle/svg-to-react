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

    beforeEach(async () => {
      processFiles = await fromPaths(basicOptions, [
        '/full/path/one/alpha.svg',
        '/full/path/two/beta.svg',
      ])
    })

    it('should set the input file path', async () => {
      expect(processFiles.map(({ input }) => input.path)).toEqual([
        '/full/path/one/alpha.svg',
        '/full/path/two/beta.svg',
      ])
    })

    it('should set the input file name', async () => {
      expect(processFiles.map(({ input }) => input.name)).toEqual([
        'alpha',
        'beta',
      ])
    })

    it('should set the input file contents', async () => {
      expect(processFiles.map(({ input }) => input.content)).toEqual([
        'MOCK /full/path/one/alpha.svg',
        'MOCK /full/path/two/beta.svg',
      ])
    })

    it('should set an empty output path', () => {
      expect(processFiles.map(({ output }) => output.path)).toEqual(['', ''])
    })

    it('should set the output name as the input file name', async () => {
      expect(processFiles.map(({ output }) => output.name)).toEqual([
        'alpha',
        'beta',
      ])
    })

    it('should set the output contents as the input file contents', async () => {
      expect(processFiles.map(({ input }) => input.content)).toEqual([
        'MOCK /full/path/one/alpha.svg',
        'MOCK /full/path/two/beta.svg',
      ])
    })
  })
})
