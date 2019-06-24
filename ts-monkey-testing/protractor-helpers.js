const prot = require("protractor");
const fs = require("fs");
const crypto = require("crypto");

const {
  RX_TIMESTAMPSTARTED,
  RX_ENDPOINT_BROWSER_NAME,
  TEST_REPORT_FILENAME,
  RX_SCREENSHOT_ON_FAILURE } = process.env;

module.exports = {
  onPrepare: async function () {
    if (RX_SCREENSHOT_ON_FAILURE === "true") {
      jasmine.Spec.prototype.execute = function (onComplete, enabled) {
        var self = this;

        this.onStart(this);

        var fns = this.beforeAndAfterFns();
        fns.afters.unshift(fns.afters.pop());
        var regularFns = fns.befores.concat(this.queueableFn);

        var runnerConfig = {
          isLeaf: true,
          queueableFns: regularFns,
          cleanupFns: fns.afters,
          onException: function () { self.onException.apply(self, arguments); },
          onComplete: complete,
          userContext: this.userContext()
        };

        if (!this.isExecutable() || this.markedPending || enabled === false) {
          runnerConfig.queueableFns = [];
          runnerConfig.cleanupFns = [];
          runnerConfig.onComplete = function () { complete(enabled); };
        }

        this.queueRunnerFactory(runnerConfig);

        function complete(enabledAgain) {
          self.result.status = self.status(enabledAgain);
          self.resultCallback(self.result);

          if (onComplete) {
            onComplete();
          }
        }
      };

      afterEach((done) => {
        const currentSpec = jasmine.getEnv().currentSpec;
        const failed = currentSpec["failedExpectations"];
        if (failed.length) {
          prot.browser.takeScreenshot().then((png) => {
            const dirPath = './reports/screenshots/';
            if (!fs.existsSync('./reports')) {
              fs.mkdirSync('./reports');
            }
            if (!fs.existsSync(dirPath)) {
              fs.mkdirSync(dirPath);
            }
            const hash = crypto.createHash("md5").update(jasmine.getEnv().currentSuite.description + currentSpec.description).digest("hex");
            const fileName = `${RX_TIMESTAMPSTARTED}-${RX_ENDPOINT_BROWSER_NAME}-${hash}.jpg`;
            const stream = fs.createWriteStream(dirPath + fileName);
            stream.write(new Buffer(png, 'base64'));
            stream.end();
            done();
          }).catch(() => {
            done();
          });
        } else {
          done();
        }
      });
    }

    const session = await prot.browser.getSession();
    const jasmineReporters = require('jasmine-reporters');
    const junitReporter = new jasmineReporters.JUnitXmlReporter({
      savePath: 'temp-reports/',
      consolidateAll: true,
      filePrefix: `${session.getId()}-${TEST_REPORT_FILENAME}`
    });

    const currentSpecReporter = {
      specStarted: (result) => {
        jasmine.getEnv().currentSpec = result;
      },
      specDone: () => {
        jasmine.getEnv().currentSpec = null;
      },
      suiteStarted: (result) => {
        jasmine.getEnv().currentSuite = result;
      },
      suiteDone: () => {
        jasmine.getEnv().currentSuite = null;
      }
    }

    jasmine.getEnv().addReporter(junitReporter);
    jasmine.getEnv().addReporter(currentSpecReporter);
  }
}
