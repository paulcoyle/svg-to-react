import { Options } from '~/src/options'

export const basicOptions: Options = {
  configPath: '/path/to/config-file.json',
  config: {
    preProcess: {
      fromIllustrator: true,
      set: [],
      remove: [],
      replace: [],
    },
    convert: {
      componentTemplate: [''],
    },
    finalize: {
      indexTemplate: [''],
    },
  },
  inputPath: '/path/to/input-files',
  outputPath: '/path/to/output-files',
}
