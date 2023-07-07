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
import { sleep } from '../utils';

/**
 * Tests for public methods new Gltf Plugin.
 * Only happy-path
 *
 **/
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
            zoom: 17.5,
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

    // Case for verify another ambient light at the scene
    it('_constructor', async () => {
        await page.close();
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
            zoom: 17.5,
            center: [82.88688745100029, 54.98064452796862],
            rotation: -111,
            pitch: 45,
        });
        await page.evaluate(() => {
            window.gltfPlugin = new window.GltfPlugin(window.map, {
                modelsLoadStrategy: 'dontWaitAll',
                dracoScriptsUrl: 'libs/draco/',
                ambientLight: { color: '#ff0000', intencity: 2.5 },
            });
            return window.gltfPlugin.addModel(window.OBJECTS_FOR_TESTS.models.cubeBig);
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, '_constructor');
    });

    it('addModel', async () => {
        await page.evaluate(() => {
            return window.gltfPlugin.addModel(window.OBJECTS_FOR_TESTS.models.cubeBig);
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_model');
    });

    it('addModels', async () => {
        await page.evaluate(() => {
            return window.gltfPlugin.addModels([
                window.OBJECTS_FOR_TESTS.models.cubeBig,
                window.OBJECTS_FOR_TESTS.models.cubeSmall,
            ]);
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_models');
    });

    it('addPoiGroup', async () => {
        await page.evaluate(() => {
            window.gltfPlugin.addPoiGroup(window.OBJECTS_FOR_TESTS.poi.asciiLetters);
            window.gltfPlugin.addPoiGroup(window.OBJECTS_FOR_TESTS.poi.engRusLetters);
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_poi_group');
    });

    it('removeModel', async () => {
        await page.evaluate(() => {
            return window.gltfPlugin.addModel(window.OBJECTS_FOR_TESTS.models.cubeBig);
        });
        await sleep(1000);
        await page.evaluate(() => {
            window.gltfPlugin.removeModel(window.OBJECTS_FOR_TESTS.models.cubeBig.modelId);
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'remove_model');
    });

    it('removePoiGroup', async () => {
        await page.evaluate(() => {
            window.gltfPlugin.addPoiGroup(window.OBJECTS_FOR_TESTS.poi.asciiLetters);
        });
        await page.evaluate(() => {
            window.gltfPlugin.removePoiGroup(window.OBJECTS_FOR_TESTS.poi.asciiLetters.id);
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'remove_poi_group');
    });

    it('addRealtyScene', async () => {
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
            zoom: 17.5,
            center: [47.245286302641034, 56.134743473834099],
            rotation: 330,
            pitch: 45,
        });

        await page.evaluate(() => {
            window.gltfPlugin = new window.GltfPlugin(window.map, {
                modelsLoadStrategy: 'dontWaitAll',
                dracoScriptsUrl: 'libs/draco/',
                modelsBaseUrl:
                    'https://disk.2gis.com/digital-twin/models_s3/realty_ads/zgktechnology/',
            });
        });
        await waitForReadiness(page);
        await page.evaluate(() => {
            return window.gltfPlugin.addRealtyScene(window.OBJECTS_FOR_TESTS.mapRealtyScene);
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_realty_scene');
    });

    it('addModelsPartially', async () => {
        await page.evaluate(() => {
            return window.gltfPlugin.addModelsPartially(
                [
                    window.OBJECTS_FOR_TESTS.models.cubeBig,
                    window.OBJECTS_FOR_TESTS.models.cubeSmall,
                ],
                [window.OBJECTS_FOR_TESTS.models.cubeBig.modelId],
            );
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_models_partially');
    });
});
