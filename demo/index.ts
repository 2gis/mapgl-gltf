import { load } from '@2gis/mapgl';
import { ThreeJsPlugin, THREE } from '../src/index';

async function start() {
    const mapglAPI = await load();
    const mapCenter = [82.886554, 54.980988];

    const map = new mapglAPI.Map('container', {
        center: mapCenter,
        zoom: 18,
        key: 'cb20c5bf-34d3-4f0e-9b2b-33e9b8edb57f',
        pitch: 45,
    });

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.7);
    directionalLight.position.set(0.5, 1, 0.5);

    new ThreeJsPlugin(map, {
        position: mapCenter,
        modelPath: 'models/cube_draco.glb',
        rotateX: 90,
        scale: 1000,
        light: [ambientLight, directionalLight],
    });
}

start();
