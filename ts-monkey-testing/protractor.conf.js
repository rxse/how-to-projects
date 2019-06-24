// @ts-check
const prot = require("protractor");
const Promise = require("es6-promise").Promise;
const helpers = require('./protractor-helpers');

/** @type {prot.Config} */
const configuration = {
  allScriptsTimeout: 130 * 1000,
  framework: "jasmine",
  specs: [`dist/${process.env.RX_TESTFOLDER || "test/tests"}/**/*.js`],
  // You could set no globals to true to avoid jQuery '$' and protractor '$'
  // collisions on the global namespace.
  noGlobals: false,
  restartBrowserBetweenTests: process.env.RX_DEBUG === "true" ? false : true,
  SELENIUM_PROMISE_MANAGER: false,
  onPrepare: function() {
    prot.browser.ignoreSynchronization = true;
    return helpers.onPrepare();
  },
  jasmineNodeOpts: {
    defaultTimeoutInterval: parseInt(process.env.RX_DEFAULT_TIMEOUT, 10)
  },
  beforeLaunch: function() {
    require('ts-node').register();
  },
  onComplete: function() {
    return process.env.RX_DEBUG !== "true" ? Promise.resolve() : new Promise(function(resolve) { });
  }
};

if (process.env.RX_ENDPOINT_TYPE === "saucelabs") {
  if (process.env.RX_PROXY) {
    const HTTPSProxyAgent = require('https-proxy-agent');
    const sauceRestAgent = new HTTPSProxyAgent(process.env.RX_PROXY);
    configuration.sauceAgent = sauceRestAgent;
    configuration.webDriverProxy = process.env.RX_PROXY;
  }

  /** @type {prot.Config["capabilities"]} */
  let capabilities = {};
  try { capabilities = JSON.parse(process.env.RX_ENDPOINT_CAPABILITIES) } catch (e) { /* */ }
  capabilities = Object.assign({
    browserName: process.env.RX_ENDPOINT_BROWSER,
    platform: process.env.RX_ENDPOINT_PLATFORM,
    version: process.env.RX_ENDPOINT_VERSION
  }, capabilities);

  configuration.multiCapabilities = [capabilities];
  configuration.sauceUser = process.env.RX_ENDPOINT_USER;
  configuration.sauceKey = process.env.RX_ENDPOINT_KEY;
} else if (process.env.RX_ENDPOINT_TYPE === "seleniumgrid") {
  if (process.env.RX_PROXY) {
    configuration.webDriverProxy = process.env.RX_PROXY;
  }

  /** @type {prot.Config["capabilities"]} */
  let capabilities = {};
  try { capabilities = JSON.parse(process.env.RX_ENDPOINT_CAPABILITIES) } catch (e) { /* */ }
  capabilities = Object.assign({
    browserName: process.env.RX_ENDPOINT_BROWSER,
    platform: process.env.RX_ENDPOINT_PLATFORM,
    version: process.env.RX_ENDPOINT_VERSION
  }, capabilities);


  configuration.multiCapabilities = [capabilities];
  configuration.seleniumAddress = process.env.RX_ENDPOINT_GRID_URL;
} else if (process.env.RX_ENDPOINT_TYPE === "custom") {
  if (process.env.RX_PROXY) {
    configuration.webDriverProxy = process.env.RX_PROXY;
  }

  /** @type {prot.Config["capabilities"]} */
  let capabilities = {};
  try { capabilities = JSON.parse(process.env.RX_ENDPOINT_CAPABILITIES) } catch (e) { /* */ }

  configuration.multiCapabilities = [capabilities];
  configuration.seleniumAddress = process.env.RX_ENDPOINT_GRID_URL;
} else {
  /** @type {prot.Config["capabilities"]} */
  let capabilities = {};
  try { capabilities = JSON.parse(process.env.RX_ENDPOINT_CAPABILITIES) } catch (e) { /* */ }
  configuration.capabilities = Object.assign({
    browserName: process.env.RX_ENDPOINT_BROWSER,
    operaOptions: {
      args: [],
      extensions: [],
      binary: process.env.RX_OPERA_PATH
    }
  }, capabilities);

  if (process.env.RX_ENDPOINT_TYPE === "android") {
    configuration.capabilities.chromeOptions = {
      androidPackage: "com.android.chrome"
    }
  }

  if (!process.env.RX_USE_WEBDRIVER_MANAGER) {
    configuration.seleniumAddress = "http://localhost:4444/wd/hub";
  }
  configuration.seleniumPort = 4444;
}

const headless = process.env.RX_ENDPOINT_HEADLESS;
if (headless === "true") {
  switch (configuration.capabilities.browserName) {
    case "chrome":
      configuration.capabilities.chromeOptions = {
        args: ["--headless"]
      };
      break;

    case "firefox":
      configuration.capabilities['moz:firefoxOptions'] = {
        args: ["--headless"]
      }
      break;
  }
} else if (process.env.RX_DEBUG === "true" && configuration.capabilities.browserName === "chrome" && process.env.RX_SELOCITYPATH) {
  configuration.capabilities.chromeOptions = {
    args: ["--load-extension=" + process.env.RX_SELOCITYPATH, "--auto-open-devtools-for-tabs"],
    prefs: {
      "devtools.preferences.currentDockState": "\"undocked\""
    }
  };
}

exports.config = configuration;
