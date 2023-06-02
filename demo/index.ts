import { load } from '@2gis/mapgl';
import { GltfPlugin } from '../src/index';

import type { ModelOptions } from '../src/types/plugin';

async function start() {
    const mapglAPI = await load();

    const map = new mapglAPI.Map('container', {
        center: [82.886554, 54.980988],
        zoom: 15.5,
        key: 'cb20c5bf-34d3-4f0e-9b2b-33e9b8edb57f',
        pitch: 45,
        rotation: 330,
        enableTrackResize: true,
    });

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

    plugin.on('click', (e) => {
        if (e.target.type === 'model') {
            // console.log('model click, id = ', e.target.data.id);
            console.log(e);
        }
    });

    plugin.on('mousemove', (e) => {
        if (e.target.type === 'model') {
            console.log('model mousemove, id = ', e.target.data.id);
        }
    });

    plugin.on('mouseover', (e) => {
        if (e.target.type === 'model') {
            console.log('model mouseover, id = ', e.target.data.id);
        }
    });

    plugin.on('mouseout', (e) => {
        if (e.target.type === 'model') {
            console.log('model mouseout, id = ', e.target.data.id);
        }
    });

    plugin.on('click', (e) => {
        if (e.target.type === 'poi') {
            console.log(e);
        }
    });

    plugin.on('mousemove', (e) => {
        if (e.target.type === 'poi') {
            console.log('poi mousemove, id = ', e.target.data.label);
        }
    });

    plugin.on('mouseover', (e) => {
        if (e.target.type === 'poi') {
            console.log('poi mouseover, id = ', e.target.data.label);
        }
    });

    plugin.on('mouseout', (e) => {
        if (e.target.type === 'poi') {
            console.log('poi mouseout, id = ', e.target.data.label);
        }
    });

    /*
    const models: ModelOptions[] = [
        {
            id: '03a234cb',
            coordinates: [82.886554, 54.980988],
            modelUrl: 'models/cube_draco.glb',
            rotateX: 90,
            scale: 1000,
            linkedIds: ['141373143530065', '70030076379181421'],
        },
        {
            id: 'e3a837ff',
            coordinates: [82.886454, 54.980388],
            modelUrl: 'models/cube_draco.glb',
            rotateX: 90,
            rotateY: 31,
            scale: 700,
            linkedIds: ['141373143530064', '70030076379180575'],
            offsetX: 30,
        },
    ];
    */

    const models: ModelOptions[] = [];
    for (let i = 0; i < 10; i++) {
        let lonRnd = (Math.random() / 100) * (Math.random() > 0.5 ? 1 : -1);
        let latRnd = (Math.random() / 100) * (Math.random() > 0.5 ? 1 : -1);
        models.push({
            id: i,
            buildingId: 'buildingId' + i,
            floorId: 'floorId' + i,
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
            buildingId: '12345',
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
            buildingId: '12345',
            floorId: '234234',
        },
    );
}

start();
