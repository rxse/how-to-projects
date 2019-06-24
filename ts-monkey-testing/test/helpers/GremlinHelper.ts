import { ProtractorBrowser } from 'protractor';
import * as fs from 'mz/fs';
const GREMLINS_SCRIPT_PATH = './test/helpers/gremlins.min.js';
export function getFpsResults(results) {
  return [
    ...results.log.filter(findFpsMessages),
    ...results.info.filter(findFpsMessages),
    ...results.warn.filter(findFpsMessages),
    ...results.error.filter(findFpsMessages)
  ].map((r) => r.pop());
}
export async function readGremlnsScript(): Promise<string> {
  return await fs.readFile(GREMLINS_SCRIPT_PATH, 'utf8');
}

export function unleashGremlins(callback: (args?: any) => void) {
  const logs = {
    log: [],
    info: [],
    warn: [],
    error: []
  };

  const stop = () => {
    horde.stop();
    callback(logs);
  };

  if (!(window as any).gremlins) {
    callback(logs);
  }

  window.onbeforeunload = stop;
  setTimeout(stop, 20000);

  const horde = (window as any).gremlins.createHorde();
  horde
    .seed(321)
    .logger({
      log: (...args) => { logs.log.push(args); },
      info: (...args) => { logs.info.push(args); },
      warn: (...args) => { logs.warn.push(args); },
      error: (...args) => { logs.error.push(args); }
    })
    .after(() => {
      callback(logs);
    })
    .unleash({}, () => {
      callback(logs);
    });
}

function findFpsMessages(log: any[]) {
  return log.find((l: string) => {
    return l.toString().startsWith('fps');
  });
}
