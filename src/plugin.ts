import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import type { Map } from '@2gis/mapgl/types';

import { mapPointFromLngLat, triggerMapRerender } from './utils';

interface PluginOptions {
    posLngLat: number[];
    modelUrl: string;
}

export class ThreeJsPlugin {
    private renderer = new THREE.WebGLRenderer();
    private camera = new THREE.PerspectiveCamera();
    private scene = new THREE.Scene();
    private model = new THREE.Mesh();
    private tmpMatrix = new THREE.Matrix4();
    private map: Map;
    private meshPosition: number[];
    private modelUrl: string;

    constructor(map: Map, options: PluginOptions) {
        this.map = map;
        this.meshPosition = mapPointFromLngLat(options.posLngLat);
        this.modelUrl = options.modelUrl;

        map.once('idle', () => {
            map.addLayer({
                id: 'my',
                type: 'custom',
                onAdd: () => this.initThree(),
                render: () => this.render(),
                onRemove: () => console.log('remove custom layer external callback'),
            });
        });
    }

    private render() {
        this.camera.projectionMatrix.fromArray((this.map as any)._impl.modules.camera.projectionMatrix);
        this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();

        this.tmpMatrix.fromArray(this.map.getProjectionMatrix());
        this.camera.matrixWorldInverse.multiplyMatrices(this.camera.projectionMatrixInverse, this.tmpMatrix);

        this.camera.matrixWorld.copy(this.camera.matrixWorldInverse).invert();
        this.camera.matrix.copy(this.camera.matrixWorld);
        this.camera.matrix.decompose(this.camera.position, this.camera.quaternion, this.camera.scale);

        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
    }

    private initThree() {
        this.camera = new THREE.PerspectiveCamera();

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.map.getCanvas(),
            context: this.map.getWebGLContext(),
            antialias: window.devicePixelRatio < 2,
        });
        this.renderer.autoClear = false;

        const light = new THREE.AmbientLight(0x777777);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 0, 1);

        this.scene.add(light, directionalLight);

        const loadingManager = new THREE.LoadingManager();
        const dracoLoader = new DRACOLoader(loadingManager).setDecoderPath(
            'static/libs/draco/',
        );
        const loader = new GLTFLoader().setDRACOLoader(dracoLoader);
        loader.load(
            this.modelUrl,
            (gltf: GLTF) => {
                this.model.add(gltf.scene);
                this.model.rotateX(Math.PI / 2);
                const mapPointCenter = [this.meshPosition[0], this.meshPosition[1], 0];
                const k = 1000;
                this.model.scale.set(k, k, k);
                this.model.position.set(mapPointCenter[0], mapPointCenter[1], k / 2);
                this.scene.add( this.model );
                triggerMapRerender(this.map);
            },
            () => {},
            () => {},
        );
    }
}
