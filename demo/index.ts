import { load } from '@2gis/mapgl';

import { GltfPlugin } from '../src/index';
import { realtyScene } from './realtySceneData';

async function start() {
    const mapglAPI = await load();

    const map = new mapglAPI.Map('container', {
        center: [47.245286302641034, 56.134743473834099],
        zoom: 17.9,
        key: 'cb20c5bf-34d3-4f0e-9b2b-33e9b8edb57f',
        pitch: 45,
        rotation: 330,
        enableTrackResize: true,
    });

    (window as any).map = map;

    const plugin = new GltfPlugin(map, {
        modelsLoadStrategy: 'waitAll',
        modelsBaseUrl: 'https://disk.2gis.com/digital-twin/models_s3/realty_ads/zgktechnology/',
        dracoScriptsUrl: 'libs/draco/',
        poiConfig: {
            primary: {
                fontSize: 14,
            },
            secondary: {
                fontSize: 14,
            },
        },
    });

    const defaultState = {
        modelId: '03a234cb',
        // floorId: '235034',
    };

    plugin.addRealtyScene(realtyScene);

    (['click'] as const).forEach((eventName) => {
        plugin.on(eventName, (e) => {
            console.log(e);
        });
    });

    /*
    const models: ModelOptions[] = [];
    for (let i = 0; i < 10; i++) {
        let lonRnd = (Math.random() / 100) * (Math.random() > 0.5 ? 1 : -1);
        let latRnd = (Math.random() / 100) * (Math.random() > 0.5 ? 1 : -1);
        models.push({
            modelId: i,
            coordinates: [82.8865 + lonRnd, 54.9809 + latRnd],
            modelUrl: 'models/cube_draco.glb',
            rotateX: 90,
            scale: 3000,
            linkedIds: ['141373143530065', '70030076379181421'],
            userData: {
                test: 'Test userData ' + i,
            },
        });
    }

    plugin
        .addModels(models)
        .then(() => {
            console.log('Models are loaded');
        })
        .catch((e) => {
            console.error(e);
        });

    plugin.addPoiGroup(
        {
            id: 1,
            type: 'primary',
            minZoom: 15,
            elevation: 130,
            fontSize: 16,
            fontColor: '#3a3a3a',
            data: [
                {
                    coordinates: [82.886454, 54.980388],
                    elevation: 130,
                    label: '3к\n78.4 м²',
                    userData: {
                        url: 'https://a101.ru/kvartiry/360810/',
                    },
                },
            ],
        },
        {
            modelId: '12345',
            floorId: '234234',
        },
    );

    plugin.addPoiGroup(
        {
            id: 2,
            type: 'secondary',
            minZoom: 17,
            elevation: 30,
            data: [
                {
                    coordinates: [82.886554, 54.980988],
                    label: '10 м²',
                    userData: {
                        url: 'https://a101.ru/kvartiry/360810/',
                    },
                },
            ],
        },
        {
            modelId: '12345',
            floorId: '234234',
        },
    );
    */
}

start();
