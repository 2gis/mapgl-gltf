import type { ModelSceneOptions } from '../src/types/plugin';

export const realtyScene: ModelSceneOptions[] = [
    {
        modelId: '03a234cb',
        coordinates: [47.245286302641034, 56.134743473834099],
        modelUrl: 'zgktechnology1.glb',
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
                modelUrl: 'zgktechnology1_floor2.glb',
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
                modelUrl: 'zgktechnology1_floor11.glb',
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
        modelUrl: 'zgktechnology2.glb',
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
                modelUrl: 'zgktechnology2_floor2.glb',
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
                modelUrl: 'zgktechnology2_floor16.glb',
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
        modelUrl: 'zgktechnology_construction.glb',
        rotateX: 90,
        rotateY: -15.1240072739039,
        scale: 191.637678,
        linkedIds: ['70030076561388553'],
    },
];
