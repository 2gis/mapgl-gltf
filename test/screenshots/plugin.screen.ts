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
        modelsBaseUrl?: string;
        groundCoveringColor?: string;
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
        center: opts.center ?? [82.88657676327911, 54.98075155383938],
        rotation: opts.rotation ?? -111,
        pitch: 45,
        disableAntiAliasing: true,
    });

    await page.evaluate(
        ({ modelsBaseUrl, groundCoveringColor }) => {
            window.gltfPlugin = new window.GltfPlugin(window.map, {
                modelsLoadStrategy: 'dontWaitAll',
                modelsBaseUrl,
                groundCoveringColor,
            });
        },
        {
            modelsBaseUrl: opts.modelsBaseUrl ?? '',
            groundCoveringColor: opts.groundCoveringColor ?? '#F8F8EBCC',
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

    it('#addLabelGroup', async () => {
        await init(page);
        await page.evaluate(() => {
            window.gltfPlugin.addLabelGroup(window.MOCKS.labels.asciiLetters);
            window.gltfPlugin.addLabelGroup(window.MOCKS.labels.engRusLetters);
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_label_group');
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

    it('#removeLabelGroup', async () => {
        await init(page);
        await page.evaluate(() => {
            window.gltfPlugin.addLabelGroup(window.MOCKS.labels.asciiLetters);
        });
        await page.evaluate(() => {
            window.gltfPlugin.removeLabelGroup(window.MOCKS.labels.asciiLetters.id);
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'remove_label_group');
    });

    it('#addModels partially', async () => {
        await init(page);
        await page.evaluate(() => {
            return window.gltfPlugin.addModels(
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
                groundCoveringColor: 'rgba(0, 0, 0, 0.8)',
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

        it('Hide and show a realty scene', async () => {
            await page.evaluate(() => {
                return window.gltfPlugin.addRealtyScene(window.MOCKS.realtyScene);
            });
            await waitForReadiness(page);

            await page.evaluate(() => {
                return window.gltfPlugin.hideRealtyScene();
            });
            await makeSnapshot(page, dirPath, 'hide_realty_scene');

            await page.evaluate(() => {
                return window.gltfPlugin.showRealtyScene();
            });
            await waitForReadiness(page);
            await makeSnapshot(page, dirPath, 'show_realty_scene');
        });

        it('Hide and show an underground realty scene', async () => {
            await page.evaluate(() => {
                return window.gltfPlugin.addRealtyScene(window.MOCKS.realtyScene, {
                    buildingId: '03a234cb',
                    floorId: '235034',
                });
            });
            await waitForReadiness(page);

            await page.evaluate(() => {
                return window.gltfPlugin.hideRealtyScene();
            });
            await waitForReadiness(page);
            await makeSnapshot(page, dirPath, 'hide_underground_realty_scene');

            await page.evaluate(() => {
                return window.gltfPlugin.showRealtyScene();
            });
            await waitForReadiness(page);
            await makeSnapshot(page, dirPath, 'show_underground_realty_scene');
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
