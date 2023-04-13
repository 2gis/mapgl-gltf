import { load } from '@2gis/mapgl';
import { ThreeJsPlugin } from '../src/index';

async function start() {
    const mapglAPI = await load();
    const mapCenter = [82.886554, 54.980988];

    const map = new mapglAPI.Map('container', {
        center: mapCenter,
        zoom: 18,
        key: 'cb20c5bf-34d3-4f0e-9b2b-33e9b8edb57f',
        pitch: 45,
    });

    new ThreeJsPlugin(map, {
        posLngLat: mapCenter,
        modelUrl: 'models/cube_draco.glb',
    });
}

start();
