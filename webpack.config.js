const { defaultConfig } = require('@adalo/cli/src/webpackConfig')

module.exports = {
  ...defaultConfig,
  resolve: {
    ...defaultConfig.resolve,
    fallback: {
      'react/jsx-runtime': require.resolve('react/jsx-runtime'),
    },
  },
}
