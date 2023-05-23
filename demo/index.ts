import { load } from '@2gis/mapgl';
import { GltfPlugin } from '../src/index';

async function start() {
    const mapglAPI = await load();

    const map = new mapglAPI.Map('container', {
        center: [82.886554, 54.980988],
        zoom: 18,
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
        console.log(e);
    });

    plugin
        .addModels([
            {
                id: 1,
                coordinates: [82.886554, 54.980988],
                modelUrl: 'models/cube_draco.glb',
                rotateX: 90,
                scale: 1000,
                linkedIds: ['141373143530065', '70030076379181421'],
            },
            {
                id: 2,
                coordinates: [82.886454, 54.980388],
                modelUrl: 'models/cube_draco.glb',
                rotateX: 90,
                rotateY: 31,
                scale: 700,
                linkedIds: ['141373143530064', '70030076379180575'],
                offsetX: 30,
            },
        ])
        .then(() => {
            console.log('Models are loaded');
        })
        .catch((e) => {
            console.error(e);
        });

    plugin.addPoiGroup({
        id: 1,
        type: 'primary',
        minZoom: 17,
        data: {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {
                        elevation: 30,
                        type: 'immersive_poi',
                        label: '3к\n78.4 м²',
                        url: 'https://a101.ru/kvartiry/360810/',
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [82.886454, 54.980388],
                    },
                },
            ],
        },
    });

    plugin.addPoiGroup({
        id: 2,
        type: 'secondary',
        minZoom: 17,
        data: {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    properties: {
                        elevation: 30,
                        type: 'immersive_poi',
                        label: '10 м²',
                        url: 'https://a101.ru/kvartiry/360810/',
                    },
                    geometry: {
                        type: 'Point',
                        coordinates: [82.886554, 54.980988],
                    },
                },
            ],
        },
    });
}

start();
