import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import type { Map as MapGL } from '@2gis/mapgl/types';

import { mapPointFromLngLat, triggerMapRerender, degToRad, concatUrl } from './utils';

interface PluginOptions {
    position: number[];
    modelPath: string;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    scale?: number;
    light?: THREE.Light[];
    scriptsBaseUrl?: string;
    modelsBaseUrl?: string;
}

const defaultOptions: Required<PluginOptions> = {
    position: [],
    modelPath: '',
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    scale: 1,
    light: [new THREE.AmbientLight(0xffffff, 2.9)],
    scriptsBaseUrl: '',
    modelsBaseUrl: '',
};

export class ThreeJsPlugin {
    private renderer = new THREE.WebGLRenderer();
    private camera = new THREE.PerspectiveCamera();
    private scene = new THREE.Scene();
    private model = new THREE.Mesh();
    private tmpMatrix = new THREE.Matrix4();
    private map: MapGL;
    private modelPosition: number[];
    private options = defaultOptions;

    constructor(map: MapGL, pluginOptions: PluginOptions) {
        this.map = map;
        this.modelPosition = mapPointFromLngLat(pluginOptions.position);
        this.options = { ...this.options, ...pluginOptions };

        map.once('idle', () => {
            map.addLayer({
                id: 'threeJsLayer',
                type: 'custom',
                onAdd: () => this.initThree(),
                render: () => this.render(),
                onRemove: () => {},
            });
        });
    }

    private render() {
        this.camera.projectionMatrix.fromArray(
            (this.map as any)._impl.modules.camera.projectionMatrix,
        );
        this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();

        this.tmpMatrix.fromArray(this.map.getProjectionMatrix());
        this.camera.matrixWorldInverse.multiplyMatrices(
            this.camera.projectionMatrixInverse,
            this.tmpMatrix,
        );

        this.camera.matrixWorld.copy(this.camera.matrixWorldInverse).invert();
        this.camera.matrix.copy(this.camera.matrixWorld);
        this.camera.matrix.decompose(
            this.camera.position,
            this.camera.quaternion,
            this.camera.scale,
        );

        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
    }

    private initThree() {
        const {
            rotateX,
            rotateY,
            rotateZ,
            scale,
            light,
            modelPath,
            scriptsBaseUrl,
            modelsBaseUrl,
        } = this.options;

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
        let dracoUrl = concatUrl(scriptsBaseUrl, 'libs/draco/');
        const dracoLoader = new DRACOLoader(loadingManager).setDecoderPath(dracoUrl);
        const loader = new GLTFLoader().setDRACOLoader(dracoLoader);
        const modelUrl = concatUrl(modelsBaseUrl, modelPath);

        loader.load(
            modelUrl,
            (gltf: GLTF) => {
                this.model.add(gltf.scene);
                // rotation
                this.model.rotateX(degToRad(rotateX));
                this.model.rotateY(degToRad(rotateY));
                this.model.rotateZ(degToRad(rotateZ));
                // scaling
                this.model.scale.set(scale, scale, scale);
                // position
                const mapPointCenter = [this.modelPosition[0], this.modelPosition[1], 0];
                this.model.position.set(mapPointCenter[0], mapPointCenter[1], scale / 2);
                this.scene.add(this.model);
                triggerMapRerender(this.map);
            },
            () => {},
            (e) => {
                console.error(`Loading of the model failed.`, e);
            },
        );
    }

    static THREE = THREE;
}

export { THREE };
