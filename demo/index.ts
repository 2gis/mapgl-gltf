import { load } from '@2gis/mapgl';
import { ThreeJsPlugin } from '../src/index';

async function start() {
    const mapglAPI = await load();

    const map = new mapglAPI.Map('container', {
        center: [55.31878, 25.23584],
        zoom: 18,
        key: 'cb20c5bf-34d3-4f0e-9b2b-33e9b8edb57f',
        pitch: 45,
    });

    new ThreeJsPlugin(map, {
        posLngLat: [55.31878, 25.23584],
    });
}

start();
