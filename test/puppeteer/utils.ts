/// <reference path="../../node_modules/@2gis/mapgl/global.d.ts" />

import { API_KEY, MAP_CENTER, MAP_ZOOM } from './config';
import { Page as PuppeteerPage } from 'puppeteer';
import { MatchImageSnapshotOptions } from 'jest-image-snapshot';

const { configureToMatchImageSnapshot } = require('jest-image-snapshot');

export const defaultFontsPath = 'https://mapgl.2gis.com/api/fonts';
export const defaultIconsPath = 'https://disk.2gis.com/styles/assets/icons';

const toMatchImageSnapshot = configureToMatchImageSnapshot();
expect.extend({ toMatchImageSnapshot });
declare global {
    namespace jest {
        interface Matchers<R> {
            toMatchImageSnapshot(): R;
        }
    }
}

// тип any, так как возможность задавать стиль напрямую не публичная
export const blankStyle: any = {
    version: 0,
    name: 'empty',
    background: {
        color: '#f5f2e0',
    },
    layers: [],
};

// тип any, так как возможность задавать стиль напрямую не публичная
export const blankDarkStyle: any = {
    version: 0,
    name: 'empty',
    background: {
        color: '#424242',
    },
    layers: [],
};

export function makeScreenshotsPath(relativePath: string) {
    return `test/screenshots/__screenshots__/${relativePath}`;
}

export async function initMapWithOptions(page: PuppeteerPage, options?: Partial<mapgl.MapOptions>) {
    await page.evaluate((opts) => {
        window.map = new mapgl.Map('map', opts ?? {});
    }, options as any);
}

/**
 * Инициализирует с пустым стилем (прозрачный фон) и без контролов
 */
export function initBlankMap(page: PuppeteerPage, options?: mapgl.MapOptions) {
    return initMapWithOptions(page, {
        style: blankStyle,
        styleOptions: {
            fontsPath: defaultFontsPath,
            iconsPath: defaultIconsPath,
        },
        // @ts-ignore опция не публичная
        copyright: false,
        zoomControl: false,
        key: API_KEY,
        styleZoom: MAP_ZOOM,
        center: MAP_CENTER,
        webglVersion: 1,
        ...options,
    });
}

export function options(name: string, dirPath?: string) {
    const options: MatchImageSnapshotOptions = {
        customSnapshotsDir: dirPath,
        customSnapshotIdentifier: name,
    };
    return options;
}

export async function makeSnapshot(
    page: PuppeteerPage,
    dirPath: string,
    name: string,
    matchOptions?: MatchImageSnapshotOptions,
) {
    const image: string | Buffer = await page.screenshot({ encoding: 'binary' });
    expect(image).toMatchImageSnapshot({
        customSnapshotsDir: dirPath,
        customSnapshotIdentifier: name,
        failureThresholdType: 'pixel',
        failureThreshold: 4,
        ...(matchOptions || {}),
    });
}

export async function waitForReadiness(page: PuppeteerPage) {
    await page.waitForFunction(() => window.map.isReady());
}
