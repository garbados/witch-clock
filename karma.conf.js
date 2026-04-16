process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = function (config) {
  config.set({
    browsers: ['ChromeHeadlessInsecure'],
    customLaunchers: {
      ChromeHeadlessInsecure: {
        base: 'ChromeHeadless',
        flags: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu'
        ],
      },
    },
    // The directory where the output file lives
    basePath: 'target',
    // The file itself
    files: ['test.js'],
    frameworks: ['cljs-test'],
    plugins: ['karma-cljs-test', 'karma-chrome-launcher'],
    colors: true,
    logLevel: config.LOG_INFO,
    client: {
      args: ['shadow.test.karma.init'],
      singleRun: true
    }
  })
}