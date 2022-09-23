import debugFn from 'debug'
import { isArray } from 'lodash'

const debug = debugFn('cypress:webpack-dev-server:typescriptHelper')

export const overrideSourceMaps = () => {
  try {
    // Adapted from `webpack-preprocessor/lib/typescript-overrides.ts` to work in CT

    // Find TS dependency relative to the project
    const projectTsPath = require.resolve('typescript', {
      paths: [process.cwd()],
    })

    const typescript = require(projectTsPath) as typeof import('typescript')
    const { createProgram } = typescript

    debug('typescript found, overriding typescript.createProgram()')

    typescript.createProgram = (...args: any[]) => {
      const [rootNamesOrOptions, _options] = args
      const options = isArray(rootNamesOrOptions) ? _options : rootNamesOrOptions.options

      debug('typescript unmodified createProgram options %o', options)

      // Override any TS configuration regarding sourcemaps so that we get the sourcemaps
      // we need during tests
      options.sourceMap = true

      delete options.inlineSources
      delete options.inlineSourceMap

      debug('typescript modified createProgram options %o', options)

      // @ts-ignore
      return createProgram.apply(typescript, args)
    }
  } catch (_err) {
    debug('Error while configuring TS sourcemaps %o', _err)
  }
}
