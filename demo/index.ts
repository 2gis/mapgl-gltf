import { load } from '@2gis/mapgl';
import { ThreeJsPlugin, THREE } from '../src/index';

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 2);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.7);
    directionalLight.position.set(0.5, 1, 0.5);

    const plugin = new ThreeJsPlugin(map, {
        light: [ambientLight, directionalLight],
    });

    plugin
        .addModels([
            {
                id: 1,
                coordinates: [82.886554, 54.980988],
                modelPath: 'models/cube_draco.glb',
                rotateX: 90,
                scale: 1000,
            },
            {
                id: 2,
                coordinates: [82.886454, 54.980388],
                modelPath: 'models/cube_draco.glb',
                rotateX: 90,
                rotateY: 31,
                scale: 700,
            },
        ])
        .then(() => {
            console.log('Models are loaded');
        });
}

start();
