import { load } from '@2gis/mapgl';
import { GltfPlugin } from '../src/index';
import * as THREE from 'three';
import { Map } from '@2gis/mapgl/types';

async function start() {
    const mapglAPI = await load();

    const map = new mapglAPI.Map('container', {
        center: [30.31242152752531, 59.938661736762796],
        zoom: 19,
        key: 'cb20c5bf-34d3-4f0e-9b2b-33e9b8edb57f',
        style: 'e05ac437-fcc2-4845-ad74-b1de9ce07555',
        pitch: 45,
        rotation: 330,
        enableTrackResize: true,
    });

    const plugin = new GltfPlugin(map, {
        modelsLoadStrategy: 'dontWaitAll',
        dracoScriptsUrl: 'libs/draco/',
        ambientLight: { color: '#ffffff', intencity: 0.8 },
    });

    map.on('click', (e) => {
        console.log(e);
    });

    plugin
        .addModels([
            {
                id: 1,
                coordinates: [30.312371651427508, 59.93925231920281],
                modelUrl: 'https://threejs.org/examples/models/gltf/LittlestTokyo.glb',
                rotateX: 90,
                rotateY: 38,
                scale: 15,
                linkedIds: ['141373143530065', '70030076379181421'],
            },
        ])
        .then(() => {
            console.log('Models are loaded');
            startAnimation(plugin, map);
        })
        .catch((e) => {
            console.error(e);
        });
}

function startAnimation(plugin: GltfPlugin, map: Map) {
    const model = plugin.getModel(1);
    const gltf = plugin.getSource(1);
    if (!model || !gltf) {
        return;
    }

    model.translateY(3000);
    const clock = new THREE.Clock();
    const mixer = new THREE.AnimationMixer(model);
    mixer.clipAction(gltf.animations[0]).play();

    animate();

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        mixer.update(delta);
        map.triggerRerender();
    }
}

start();
