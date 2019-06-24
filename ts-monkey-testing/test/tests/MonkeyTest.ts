// Ranorex Webtestit Test File

import { browser } from 'protractor';

import { ItemsOverviewPo } from '../pageobjects/ItemsOverviewPo';
import { getFpsResults } from '../helpers/GremlinHelper';

const TEST_PAGE = 'https://demoshop.webtestit.com';

describe('MonkeyTesting', () => {
  beforeEach(() => {
    // Make sure to set the ignoreSynchronization for every testrun
    // for non Angular applications
    browser.ignoreSynchronization = true;
  });

  it('should have no errors', async () => {
    // Open the page
    const overview = await new ItemsOverviewPo().open(TEST_PAGE);
    const { error } = await overview.startMonkeyTest();

    await expect(error.length).toBe(0);
  });

  it('should have no warnings', async () => {
    // Open the page
    const overview = await new ItemsOverviewPo().open(TEST_PAGE);
    const { warn } = await overview.startMonkeyTest();

    await expect(warn.length).toBe(0);
  });

  it('should not have FPS drops below 30', async () => {
    const overview = await new ItemsOverviewPo().open(TEST_PAGE);
    const result = await overview.startMonkeyTest();

    await expect(Math.min(...getFpsResults(result))).toBeGreaterThan(30);
  });

  it('should not have FPS drops below 60', async () => {
    const overview = await new ItemsOverviewPo().open(TEST_PAGE);
    const result = await overview.startMonkeyTest();

    await expect(Math.min(...getFpsResults(result))).toBeGreaterThan(60);
  });
});
