import 'jest'; // Подключаем типы jest
import puppeteer from 'puppeteer';
import { PAGE_HEIGHT, PAGE_WIDTH, WAIT_FOR_TIMEOUT, REFERENCE_DEMO } from './config';

interface LaunchOptions extends puppeteer.LaunchOptions {
    defaultViewport: {
        width: number;
        height: number;
        deviceScaleFactor?: number;
        isMobile?: boolean;
        hasTouch?: boolean;
        isLandscape?: boolean;
    };
}

export const opts: LaunchOptions & puppeteer.BrowserLaunchArgumentOptions = {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: {
        width: PAGE_WIDTH,
        height: PAGE_HEIGHT,
    },
};

let browser: puppeteer.Browser;
let page: Page;

beforeAll(async () => {
    browser = await puppeteer.launch(opts);
});

afterAll(() => {
    browser?.close();
});

function describeLog(jsHandle: puppeteer.JSHandle): Promise<string> {
    return jsHandle.evaluate((obj: any) => {
        if (obj === null) {
            return 'null';
        }
        return obj.stack || obj.message || JSON.stringify(obj);
    }, jsHandle);
}

export async function pageSetUp(): Promise<puppeteer.Page> {
    page = await browser.newPage();
    // Этот таймаут будет использоваться везде по умолчанию.
    // Например, не придется  его явно задавать в page.waitForFunction
    page.setDefaultTimeout(WAIT_FOR_TIMEOUT);

    page.on('console', async (msg) => {
        const args = await Promise.all(msg.args().map((arg) => describeLog(arg)));
        console.log(`PAGE LOG: ${msg.text()} ${args.join(' ')}`);
    });

    await page.goto(REFERENCE_DEMO);

    return page;
}

export type Page = puppeteer.Page;
