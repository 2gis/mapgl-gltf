import { Page, pageSetUp } from '../puppeteer';
import { initBlankMap } from '../puppeteer/utils';

describe('stub integration test', () => {
    let page: Page;

    beforeEach(async () => {
        page = await pageSetUp();
        await initBlankMap(page);
    });

    afterEach(async () => {
        await page.close();
    });

    it('stub test is ok', async () => {
        const isOk = await page.evaluate(() => {
            return window.map !== undefined && window.GltfPlugin !== undefined;
        });

        expect(isOk).toBe(true);
    });

    it('pure stub test is ok', async () => {
        expect(true).toBe(true);
    });
});
