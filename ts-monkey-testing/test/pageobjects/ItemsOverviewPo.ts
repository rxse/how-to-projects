// Ranorex Webtestit Page Object File

import { browser, element, by, ExpectedConditions } from 'protractor';

import { readGremlnsScript, unleashGremlins } from '../helpers/GremlinHelper';

export class ItemsOverviewPo {
  public async open(url: string) {
    await browser.get(url);

    return this;
  }

  public async startMonkeyTest(): Promise<any> {
    return new Promise(async (resolve) => {
      await browser.executeScript((await readGremlnsScript()));
      const result = await browser.executeAsyncScript(unleashGremlins);

      resolve(result);
    });
  }
}
