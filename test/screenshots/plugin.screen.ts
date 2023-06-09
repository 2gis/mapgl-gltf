import { pageSetUp, Page } from '../puppeteer';
import { API_KEY } from '../puppeteer/config';
import {
    makeScreenshotsPath,
    makeSnapshot,
    initMapWithOptions,
    waitForReadiness,
    blankStyle,
    defaultFontsPath,
} from '../puppeteer/utils';

describe('plugin', () => {
    let page: Page;
    const dirPath = makeScreenshotsPath('plugin');

    beforeEach(async () => {
        page = await pageSetUp();
        await initMapWithOptions(page, {
            style: blankStyle,
            styleOptions: {
                fontsPath: defaultFontsPath,
            },
            // @ts-ignore
            copyright: false,
            zoomControl: false,
            key: API_KEY,
            zoom: 16.5,
            center: [82.88688745100029, 54.98064452796862],
            rotation: -111,
            pitch: 45,
        });

        await page.evaluate(() => {
            window.gltfPlugin = new window.GltfPlugin(window.map, {
                modelsLoadStrategy: 'dontWaitAll',
                dracoScriptsUrl: 'libs/draco/',
                ambientLight: { color: '#ffffff', intencity: 2.5 },
            });
        });
        await waitForReadiness(page);
    });

    afterEach(async () => {
        await page.close();
    });

    it('addModel', async () => {
        await page.evaluate(() => {
            return window.gltfPlugin.addModels([
                {
                    modelId: 1,
                    coordinates: [82.886554, 54.980988],
                    modelUrl: 'models/cube_draco.glb',
                    rotateX: 90,
                    scale: 1000,
                },
                {
                    modelId: 2,
                    coordinates: [82.886454, 54.980388],
                    modelUrl: 'models/cube_draco.glb',
                    rotateX: 90,
                    rotateY: 31,
                    scale: 700,
                },
            ]);
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_models');
    });
});
