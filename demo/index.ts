import { load } from '@2gis/mapgl';
import { GltfPlugin } from '../src/index';

import type { ModelSceneOptions } from '../src/types/plugin';

async function start() {
    const mapglAPI = await load();

    const map = new mapglAPI.Map('container', {
        center: [47.245286302641034, 56.134743473834099],
        zoom: 17.5,
        key: 'cb20c5bf-34d3-4f0e-9b2b-33e9b8edb57f',
        pitch: 45,
        rotation: 330,
        enableTrackResize: true,
    });

    (window as any).map = map;

    const plugin = new GltfPlugin(map, {
        modelsLoadStrategy: 'dontWaitAll',
        dracoScriptsUrl: 'libs/draco/',
        ambientLight: { color: '#ffffff', intencity: 2.5 },
        poiConfig: {
            primary: {
                fontSize: 14,
            },
            secondary: {
                fontSize: 14,
            },
        },
    });

    const scene: ModelSceneOptions[] = [
        {
            modelId: '03a234cb',
            coordinates: [47.245286302641034, 56.134743473834099],
            modelUrl: 'http://localhost:3300/zgktechnology1.glb',
            rotateX: 90,
            rotateY: -15.1240072739039,
            scale: 191.637678,
            linkedIds: ['70030076555821177'],
            mapOptions: {
                center: [47.24538001651252, 56.13465445203847],
                pitch: 40,
                zoom: 19,
                rotation: -25,
            },
            floors: [
                {
                    id: '235034',
                    text: '1-10',
                    modelUrl: 'http://localhost:3300/zgktechnology1_floor 2.glb',
                    poiGroups: [
                        {
                            id: 1111,
                            type: 'primary',
                            minZoom: 19,
                            elevation: 5,
                            fontSize: 14,
                            fontColor: '#3a3a3a',
                            data: [
                                {
                                    coordinates: [47.245048150280994, 56.134470449142164],
                                    label: '3к\n78.4 м²',
                                    userData: {
                                        url: 'https://a101.ru/kvartiry/360810/',
                                    },
                                },
                                {
                                    coordinates: [47.24520807647288, 56.13443854463778],
                                    label: '2к\n67 м²',
                                    userData: {
                                        url: 'https://a101.ru/kvartiry/360810/',
                                    },
                                },
                                {
                                    coordinates: [47.245350349632965, 56.134414208205776],
                                    label: '1к\n40 м²',
                                    userData: {
                                        url: 'https://a101.ru/kvartiry/360810/',
                                    },
                                },
                                {
                                    coordinates: [47.24542896512635, 56.13448965532694],
                                    label: '3к\n90 м²',
                                    userData: {
                                        url: 'https://a101.ru/kvartiry/360810/',
                                    },
                                },
                                {
                                    coordinates: [47.24510451854659, 56.134541185948585],
                                    label: '3к\n77.2 м²',
                                    userData: {
                                        url: 'https://a101.ru/kvartiry/360810/',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    id: '000034',
                    text: '11',
                    modelUrl: 'http://localhost:3300/zgktechnology1_floor 11.glb',
                    poiGroups: [
                        {
                            id: 1111,
                            type: 'primary',
                            minZoom: 18.5,
                            elevation: 35,
                            fontSize: 14,
                            fontColor: '#3a3a3a',
                            data: [
                                {
                                    coordinates: [47.24522432278589, 56.134443278054704],
                                    label: '2к\n70 м²',
                                    userData: {
                                        url: 'https://a101.ru/kvartiry/360810/',
                                    },
                                },
                            ],
                        },
                        {
                            id: 2222,
                            type: 'secondary',
                            minZoom: 18.5,
                            elevation: 35,
                            fontSize: 12,
                            data: [
                                {
                                    coordinates: [47.24516420395748, 56.13443265820253],
                                    label: '10 м²',
                                    userData: {
                                        url: 'https://a101.ru/kvartiry/360810/',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            modelId: '1ba234cb',
            coordinates: [47.245286302641034, 56.134743473834099],
            modelUrl: 'http://localhost:3300/zgktechnology2.glb',
            rotateX: 90,
            rotateY: -15.1240072739039,
            scale: 191.637678,
            linkedIds: ['70030076555823021'],
            mapOptions: {
                center: [47.24503949969271, 56.13473264797348],
                pitch: 40,
                zoom: 18.7,
                rotation: -70,
            },
            floors: [
                {
                    id: 'aaa777',
                    text: '2-15',
                    modelUrl: 'http://localhost:3300/zgktechnology2_floor 2.glb',
                    poiGroups: [
                        {
                            id: 1111,
                            type: 'primary',
                            minZoom: 18,
                            elevation: 5,
                            fontSize: 14,
                            fontColor: '#3a3a3a',
                            data: [
                                {
                                    coordinates: [47.24452417991248, 56.13469284843933],
                                    label: '1к\n14.4 м²',
                                    userData: {
                                        url: 'https://a101.ru/kvartiry/360810/',
                                    },
                                },
                            ],
                        },
                        {
                            id: 2222,
                            type: 'secondary',
                            minZoom: 18.5,
                            elevation: 5,
                            fontSize: 12,
                            data: [
                                {
                                    coordinates: [47.244517818982104, 56.13468687293689],
                                    label: '12 м²',
                                    userData: {
                                        url: 'https://a101.ru/kvartiry/360810/',
                                    },
                                },
                            ],
                        },
                    ],
                },
                {
                    id: 'bbb555',
                    text: '16',
                    modelUrl: 'http://localhost:3300/zgktechnology2_floor 16.glb',
                    poiGroups: [
                        {
                            id: 1111,
                            type: 'primary',
                            minZoom: 18,
                            elevation: 55,
                            fontSize: 14,
                            fontColor: '#3a3a3a',
                            data: [
                                {
                                    coordinates: [47.24448821942699, 56.13463786869349],
                                    label: '2к\n35.7 м²',
                                    userData: {
                                        url: 'https://a101.ru/kvartiry/360810/',
                                    },
                                },
                            ],
                        },
                        {
                            id: 2222,
                            type: 'secondary',
                            minZoom: 18.5,
                            elevation: 55,
                            fontSize: 12,
                            data: [
                                {
                                    coordinates: [47.24446541051179, 56.13462279154826],
                                    label: '12 м²',
                                    userData: {
                                        url: 'https://a101.ru/kvartiry/360810/',
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        {
            modelId: 'eda234cb',
            coordinates: [47.245286302641034, 56.134743473834099],
            modelUrl: 'http://localhost:3300/zgktechnology_construction.glb',
            rotateX: 90,
            rotateY: -15.1240072739039,
            scale: 191.637678,
            linkedIds: ['70030076561388553'],
        },
    ];

    /*
    const defaultState = {
        modelId: '03a234cb',
        floorId: '235034',
    };
    */

    plugin.addRealtyScene(scene);

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
