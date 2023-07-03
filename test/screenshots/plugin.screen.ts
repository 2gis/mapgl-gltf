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
 * **/
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

            return window.gltfPlugin.addModel({
                modelId: 1,
                coordinates: [82.886554, 54.98085],
                modelUrl: 'models/cube_draco.glb',
                rotateX: 90,
                scale: 500,
            });
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, '_constructor');
    });

    it('addModel', async () => {
        await page.evaluate(() => {
            return window.gltfPlugin.addModel({
                modelId: 1,
                coordinates: [82.886554, 54.98085],
                modelUrl: 'models/cube_draco.glb',
                rotateX: 90,
                scale: 500,
            });
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_model');
    });

    it('addModels', async () => {
        await page.evaluate(() => {
            return window.gltfPlugin.addModels([
                {
                    modelId: 1,
                    coordinates: [82.886554, 54.98085],
                    modelUrl: 'models/cube_draco.glb',
                    rotateX: 90,
                    scale: 500,
                },
                {
                    modelId: 2,
                    coordinates: [82.886454, 54.980588],
                    modelUrl: 'models/cube_draco.glb',
                    rotateX: 90,
                    rotateY: 31,
                    scale: 250,
                },
            ]);
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_models');
    });

    it('addPoiGroup', async () => {
        await page.evaluate(() => {
            window.gltfPlugin.addPoiGroup({
                id: 1,
                type: 'primary',
                minZoom: 12,
                elevation: 40,
                fontSize: 10,
                fontColor: '#aa3a3a',
                data: [
                    {
                        coordinates: [82.886454, 54.98075],
                        elevation: 30,
                        label: '@<>?|!@#$%\n^&*()_+-=\n3к\n78.4 м²',
                        userData: {
                            url: 'https://example.com/',
                        },
                    },
                ],
            });
            return window.gltfPlugin.addPoiGroup({
                id: 2,
                type: 'primary',
                minZoom: 12,
                elevation: 20,
                fontSize: 10,
                fontColor: '#3a3a3a',
                data: [
                    {
                        coordinates: [82.886104, 54.98075],
                        elevation: 30,
                        label: 'qwe RTY пои ГРУП',
                        userData: {
                            url: 'https://example.com/',
                        },
                    },
                ],
            });
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_poi');
    });

    it('removeModel', async () => {
        await page.evaluate(() => {
            const testModel = {
                modelId: 1,
                coordinates: [82.886554, 54.98085],
                modelUrl: 'models/cube_draco.glb',
                rotateX: 90,
                scale: 500,
            };
            window.gltfPlugin.addModel(testModel);
        });
        await sleep(1000);
        await page.evaluate(() => {
            return window.gltfPlugin.removeModel('1');
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'remove_model');
    });

    it('removePoiGroup', async () => {
        await page.evaluate(() => {
            window.gltfPlugin.addPoiGroup({
                id: 1,
                type: 'primary',
                minZoom: 12,
                elevation: 40,
                fontSize: 10,
                fontColor: '#aa3a3a',
                data: [
                    {
                        coordinates: [82.886454, 54.98075],
                        elevation: 30,
                        label: '@<>?|!@#$%\n^&*()_+-=\n3к\n78.4 м²',
                        userData: {
                            url: 'https://example.com/',
                        },
                    },
                ],
            });
        });
        await page.evaluate(() => {
            return window.gltfPlugin.removePoiGroup('1');
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'remove_poi_group');
    });

    it('addRealtyScene', async () => {
        return true;
    });

    it('addModelsPartially', async () => {
        return true;
    });
});
