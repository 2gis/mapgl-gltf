import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import type { Map } from '@2gis/mapgl/types';

import { mapPointFromLngLat, triggerMapRerender, degToRad } from './utils';

interface PluginOptions {
    position: number[];
    url: string;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    scale?: number;
    light?: THREE.Light[];
}

const defaultOptions = {
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    light: [new THREE.AmbientLight(0xffffff, 2.9)],
}

export class ThreeJsPlugin {
    private renderer = new THREE.WebGLRenderer();
    private camera = new THREE.PerspectiveCamera();
    private scene = new THREE.Scene();
    private model = new THREE.Mesh();
    private tmpMatrix = new THREE.Matrix4();
    private map: Map;
    private modelPosition: number[];
    private options: Required<PluginOptions>;

    constructor(map: Map, options: PluginOptions) {
        this.map = map;
        this.modelPosition = mapPointFromLngLat(options.position);
        this.options = {...defaultOptions, ...options};

        map.once('idle', () => {
            map.addLayer({
                id: 'threeJsLayer',
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
        const { rotateX, rotateY, rotateZ, scale, light, url } = this.options;

        this.camera = new THREE.PerspectiveCamera();

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.map.getCanvas(),
            context: this.map.getWebGLContext(),
            antialias: window.devicePixelRatio < 2,
        });
        this.renderer.autoClear = false;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.useLegacyLights = false;

        this.scene.add(...light);

        const loadingManager = new THREE.LoadingManager();
        const dracoLoader = new DRACOLoader(loadingManager).setDecoderPath(
            'static/libs/draco/',
        );
        const loader = new GLTFLoader().setDRACOLoader(dracoLoader);
        loader.load(
            url,
            (gltf: GLTF) => {
                this.model.add(gltf.scene);
                // rotation
                this.model.rotateX(degToRad(90 + rotateX));
                this.model.rotateY(degToRad(rotateY));
                this.model.rotateZ(degToRad(rotateZ));
                // scaling
                this.model.scale.set(scale, scale, scale);
                // position
                const mapPointCenter = [this.modelPosition[0], this.modelPosition[1], 0];
                this.model.position.set(mapPointCenter[0], mapPointCenter[1], scale / 2);
                this.scene.add( this.model );
                triggerMapRerender(this.map);
            },
            () => {},
            () => {},
        );
    }
}

export { THREE };
