import { Options } from '~/src/options'

export const basicOptions: Options = {
  configPath: '/path/to/config-file.json',
  config: {
    set: [],
    remove: [],
    replace: [],
  },
  inputPath: '/path/to/input-files',
  outputPath: '/path/to/output-files',
  templatePath: '/path/to/template-file.ejs',
}
