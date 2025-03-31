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
import { PluginOptions } from '../../src/types/plugin';

type TestPluginOptions = Pick<
    PluginOptions,
    'minZoom' | 'maxZoom' | 'modelsBaseUrl' | 'groundCoveringColor' | 'modelsNearCameraFade'
>;

const init = async (
    page: Page,
    opts: Pick<MapOptions, 'styleZoom' | 'center' | 'rotation' | 'pitch'> & TestPluginOptions = {},
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
        styleZoom: opts.styleZoom ?? 17.5,
        center: opts.center ?? [82.88657676327911, 54.98075155383938],
        rotation: opts.rotation ?? -111,
        pitch: opts.pitch ?? 45,
        disableAntiAliasing: true,
    });

    await page.evaluate((options: TestPluginOptions) => {
        window.gltfPlugin = new window.GltfPlugin(window.map, {
            modelsLoadStrategy: 'dontWaitAll',
            modelsBaseUrl: options.modelsBaseUrl,
            groundCoveringColor: options.groundCoveringColor,
            modelsNearCameraFade: options.modelsNearCameraFade,
            minZoom: options.minZoom,
            maxZoom: options.maxZoom,
        });
    }, opts);

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
            return window.gltfPlugin.addModel(window.MOCKS.models.cubeMid);
        });

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_model');
    });

    it('#addModels', async () => {
        await init(page);
        await page.evaluate(() => {
            return window.gltfPlugin.addModels([
                window.MOCKS.models.cubeMid,
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
            return window.gltfPlugin.addModel(window.MOCKS.models.cubeMid);
        });
        await page.evaluate(() => {
            window.gltfPlugin.removeModel(window.MOCKS.models.cubeMid.modelId);
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'remove_model');
    });

    it('#removeModels', async () => {
        await init(page);
        await page.evaluate(() => {
            return window.gltfPlugin.addModels([
                window.MOCKS.models.cubeMid,
                window.MOCKS.models.cubeSmall,
            ]);
        });
        await page.evaluate(() => {
            window.gltfPlugin.removeModels([
                window.MOCKS.models.cubeMid.modelId,
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
                [window.MOCKS.models.cubeMid, window.MOCKS.models.cubeSmall],
                [window.MOCKS.models.cubeMid.modelId],
            );
        });
        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'add_models_partially');
    });

    describe('Plugin options', () => {
        describe('modelsNearCameraFade', () => {
            it('default modelsNearCameraFade', async () => {
                await init(page, { styleZoom: 19.65 });
                await page.evaluate(() => {
                    return window.gltfPlugin.addModel(window.MOCKS.models.cubeBig);
                });

                await waitForReadiness(page);
                await makeSnapshot(page, dirPath, 'plugin_options_default_modelsNearCameraFade');
            });

            it('no modelsNearCameraFade', async () => {
                await init(page, { styleZoom: 19.65, modelsNearCameraFade: 0 });
                await page.evaluate(() => {
                    return window.gltfPlugin.addModel(window.MOCKS.models.cubeBig);
                });

                await waitForReadiness(page);
                await makeSnapshot(page, dirPath, 'plugin_options_no_modelsNearCameraFade');
            });

            it('great modelsNearCameraFade', async () => {
                await init(page, { styleZoom: 19.65, modelsNearCameraFade: 50000 });
                await page.evaluate(() => {
                    return window.gltfPlugin.addModel(window.MOCKS.models.cubeBig);
                });

                await waitForReadiness(page);
                await makeSnapshot(page, dirPath, 'plugin_options_great_modelsNearCameraFade');
            });
        });

        describe('minZoom, maxZoom', () => {
            beforeEach(async () => {
                await page.setViewport({
                    width: 300,
                    height: 300,
                });
                const center = [82.88454852999983, 54.904795707733356];
                await init(page, {
                    center,
                    styleZoom: 15.8,
                    rotation: 0,
                    pitch: 0,
                    minZoom: 16,
                    maxZoom: 18,
                });
                await page.evaluate((coordinates) => {
                    return window.gltfPlugin.addModels([
                        { ...window.MOCKS.models.cubeMid, coordinates },
                        { ...window.MOCKS.models.palm, minZoom: 16.5, maxZoom: 17.25 },
                        { ...window.MOCKS.models.pine, minZoom: 17, maxZoom: 17.5 },
                    ]);
                }, center);
                await waitForReadiness(page);
            });

            it('no visible models', async () => {
                await makeSnapshot(
                    page,
                    dirPath,
                    'plugin_options_minZoom_maxZoom_no_visible_models',
                );
            });

            it('cube is only visible', async () => {
                await page.evaluate(() => {
                    window.map.setStyleZoom(16.2);
                });
                await waitForReadiness(page);
                await makeSnapshot(page, dirPath, 'plugin_options_minZoom_maxZoom_visible_cube');
            });

            it('cube and palm are visible', async () => {
                await page.evaluate(() => {
                    window.map.setStyleZoom(16.7, { animate: false });
                });
                await waitForReadiness(page);
                await makeSnapshot(
                    page,
                    dirPath,
                    'plugin_options_minZoom_maxZoom_visible_cube_and_palm',
                );
            });

            it('all models are visible', async () => {
                await page.evaluate(() => {
                    window.map.setStyleZoom(17, { animate: false });
                });
                await waitForReadiness(page);
                await makeSnapshot(
                    page,
                    dirPath,
                    'plugin_options_minZoom_maxZoom_visible_all_models',
                );
            });

            it('cube and pine are visible', async () => {
                await page.evaluate(() => {
                    window.map.setStyleZoom(17.4, { animate: false });
                });
                await waitForReadiness(page);
                await makeSnapshot(
                    page,
                    dirPath,
                    'plugin_options_minZoom_maxZoom_visible_cube_and_pine',
                );
            });

            it('cube is only visible again', async () => {
                await page.evaluate(() => {
                    window.map.setStyleZoom(17.7, { animate: false });
                });
                await waitForReadiness(page);
                await makeSnapshot(
                    page,
                    dirPath,
                    'plugin_options_minZoom_maxZoom_visible_cube_again',
                );
            });

            it('all models are invisible', async () => {
                await page.evaluate(() => {
                    window.map.setStyleZoom(18, { animate: false });
                });
                await waitForReadiness(page);
                await makeSnapshot(
                    page,
                    dirPath,
                    'plugin_options_minZoom_maxZoom_invisible_all_models',
                );
            });
        });
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

        // Тест пока заскипан, т.к. на скринах появляется контрол сцены
        // недвижимости, что приводит к падению теста на разных платформах
        it.skip('Hide and show an underground realty scene', async () => {
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
            return window.gltfPlugin.addModel(window.MOCKS.models.cubeMid);
        });
        await page.evaluate((style) => {
            return (window.map as any).setStyle(style);
        }, blankDarkStyle);

        await waitForReadiness(page);
        await makeSnapshot(page, dirPath, 'change_style');
    });
});
