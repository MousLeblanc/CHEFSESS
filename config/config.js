// Import required modules at the beginning of the file
const main = require('./lib/main');
const envOptions = require('./lib/env-options');
const cliOptions = require('./lib/cli-options');

(function () {
  main.config(
    Object.assign(
      {},
      envOptions,
      cliOptions(process.argv)
    )
  )
})()
