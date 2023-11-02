import { MapOptions } from '@2gis/mapgl/types';

import { pageSetUp, Page } from '../puppeteer';
import { API_KEY } from '../puppeteer/config';
import {
    makeScreenshotsPath,
    makeSnapshot,
    initMapWithOptions,
    waitForReadiness,
    blankStyle,
    defaultFontsPath,
    blankDarkStyle,
} from '../puppeteer/utils';

const init = async (
    page: Page,
    opts: Pick<MapOptions, 'center' | 'rotation'> & {
        ambientColor?: string;
        modelsBaseUrl?: string;
    } = {},
) => {
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
        center: opts.center ?? [82.88688745100029, 54.98064452796862],
        rotation: opts.rotation ?? -111,
        pitch: 45,
        disableAntiAliasing: true,
        webglVersion: 1,
    });

    await page.evaluate(
        ({ modelsUrl, color }) => {
            window.gltfPlugin = new window.GltfPlugin(window.map, {
                modelsLoadStrategy: 'dontWaitAll',
                dracoScriptsUrl: 'libs/draco/',
                ambientLight: {
                    color: color || '#ffffff',
                    intencity: 2.5,
                },
                modelsBaseUrl: modelsUrl || undefined,
            });
        },
        {
            modelsUrl: opts.modelsBaseUrl ?? '',
            color: opts.ambientColor ?? '',
        },
    );

    await waitForReadiness(page);
};

/**
 * Tests for public methods new Gltf Plugin.
 * Only happy-path
 */
describe('GltfPlugin', () => {
    let page: Page;
    const dirPath = makeScreenshotsPath('plugin');

    beforeEach(async () => {
        page = await pageSetUp();
    });

    afterEach(async () => {
        await page.close();
    });

    // Case for verify another ambient light at the scene
    it('#_constructor', async () => {
        await init(page, { ambientColor: '#ff0000' });
        await page.evaluate(() => {
            return window.gltfPlugin.addModel(window.MOCKS.models.cubeBig);
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, '_constructor');
    });

    it('#addModel', async () => {
        await init(page);
        await page.evaluate(() => {
            return window.gltfPlugin.addModel(window.MOCKS.models.cubeBig);
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_model');
    });

    it('#addModels', async () => {
        await init(page);
        await page.evaluate(() => {
            return window.gltfPlugin.addModels([
                window.MOCKS.models.cubeBig,
                window.MOCKS.models.cubeSmall,
            ]);
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_models');
    });

    it('#addPoiGroup', async () => {
        await init(page);
        await page.evaluate(() => {
            window.gltfPlugin.addPoiGroup(window.MOCKS.poi.asciiLetters);
            window.gltfPlugin.addPoiGroup(window.MOCKS.poi.engRusLetters);
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_poi_group');
    });

    it('#removeModel', async () => {
        await init(page);
        await page.evaluate(() => {
            return window.gltfPlugin.addModel(window.MOCKS.models.cubeBig);
        });
        await page.evaluate(() => {
            window.gltfPlugin.removeModel(window.MOCKS.models.cubeBig.modelId);
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'remove_model');
    });

    it('#removeModels', async () => {
        await init(page);
        await page.evaluate(() => {
            return window.gltfPlugin.addModels([
                window.MOCKS.models.cubeBig,
                window.MOCKS.models.cubeSmall,
            ]);
        });
        await page.evaluate(() => {
            window.gltfPlugin.removeModels([
                window.MOCKS.models.cubeBig.modelId,
                window.MOCKS.models.cubeSmall.modelId,
            ]);
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'remove_models');
    });

    it('#removePoiGroup', async () => {
        await init(page);
        await page.evaluate(() => {
            window.gltfPlugin.addPoiGroup(window.MOCKS.poi.asciiLetters);
        });
        await page.evaluate(() => {
            window.gltfPlugin.removePoiGroup(window.MOCKS.poi.asciiLetters.id);
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'remove_poi_group');
    });

    it('#addModelsPartially', async () => {
        await init(page);
        await page.evaluate(() => {
            return window.gltfPlugin.addModelsPartially(
                [window.MOCKS.models.cubeBig, window.MOCKS.models.cubeSmall],
                [window.MOCKS.models.cubeBig.modelId],
            );
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_models_partially');
    });

    describe('Realty scene', () => {
        beforeEach(async () => {
            await init(page, {
                center: [47.245286302641034, 56.134743473834099],
                rotation: 330,
                modelsBaseUrl:
                    'https://disk.2gis.com/digital-twin/models_s3/realty_ads/zgktechnology/',
            });
        });

        it('#addRealtyScene', async () => {
            await page.evaluate(() => {
                return window.gltfPlugin.addRealtyScene(window.MOCKS.realtyScene);
            });
            await waitForReadiness(page);
            await makeSnapshot(page, dirPath, 'add_realty_scene');
        });

        it('#removeRealtyScene', async () => {
            await page.evaluate(() => {
                return window.gltfPlugin.addRealtyScene(window.MOCKS.realtyScene);
            });
            await waitForReadiness(page);
            await page.evaluate(() => {
                return window.gltfPlugin.removeRealtyScene();
            });
            await waitForReadiness(page);
            await makeSnapshot(page, dirPath, 'remove_realty_scene');
        });
    });

    it('The model does not disappear after changing the map style.', async () => {
        await init(page);
        await page.evaluate(() => {
            return window.gltfPlugin.addModel(window.MOCKS.models.cubeBig);
        });
        await page.evaluate((style) => {
            return (window.map as any).setStyle(style);
        }, blankDarkStyle);

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'change_style');
    });
});
