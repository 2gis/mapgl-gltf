import { Page, pageSetUp } from '../puppeteer';
import { initBlankMap, waitForReadiness } from '../puppeteer/utils';

describe('Events', () => {
    let page: Page;

    beforeEach(async () => {
        page = await pageSetUp();
        await initBlankMap(page, {
            center: [47.245286302641034, 56.134743473834099],
            styleZoom: 18,
        });
        await page.evaluate(() => {
            window.gltfPlugin = new window.GltfPlugin(window.map, {
                modelsBaseUrl:
                    'https://disk.2gis.com/digital-twin/models_s3/realty_ads/zgktechnology/',
            });
        });
    });

    afterEach(async () => {
        await page.close();
    });

    describe('activemodelchange', () => {
        it('activemodelchange is emitted on adding realty scene with a state', async () => {
            const buildingId = '03a234cb';
            const floorId = '235034';
            await page.evaluate(
                (buildingId, floorId) => {
                    window.spy = window.sinon.spy();
                    window.gltfPlugin.on('activemodelchange', window.spy);
                    return window.gltfPlugin.addRealtyScene(window.MOCKS.realtyScene, {
                        buildingId,
                        floorId,
                    });
                },
                buildingId,
                floorId,
            );
            await waitForReadiness(page);
            expect(await page.evaluate(() => window.spy.firstCall.args[0])).toEqual({
                buildingModelId: buildingId,
                floorModelId: floorId,
            });
        });
    });
});
