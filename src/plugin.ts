import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import type { Map as MapGL } from '@2gis/mapgl/types';

import { mapPointFromLngLat, degToRad, concatUrl } from './utils';

interface AmbientLightOptions {
    color: THREE.ColorRepresentation;
    intencity: number;
}

interface PluginOptions {
    ambientLight?: AmbientLightOptions;
    dracoScriptsUrl?: string;
    modelsBaseUrl?: string;
    modelsLoadStrategy?: 'dontWaitAll' | 'waitAll';
}

interface ModelOptions {
    id: number | string;
    coordinates: number[];
    modelPath: string;
    rotateX?: number;
    rotateY?: number;
    rotateZ?: number;
    scale?: number;
}

const defaultOptions: Required<PluginOptions> = {
    ambientLight: {
        color: 0xffffff,
        intencity: 2.9,
    },
    dracoScriptsUrl: 'libs/draco/',
    modelsBaseUrl: '',
    modelsLoadStrategy: 'waitAll',
};

export class GltfPlugin {
    private renderer = new THREE.WebGLRenderer();
    private camera = new THREE.PerspectiveCamera();
    private scene = new THREE.Scene();
    private tmpMatrix = new THREE.Matrix4();
    private map: MapGL;
    private options = defaultOptions;
    private loader = new GLTFLoader();
    private onThreeJsInit = () => {}; // resolve of waitForThreeJsInit
    private waitForThreeJsInit = new Promise<void>((resolve) => (this.onThreeJsInit = resolve));
    private models = new Map<string, THREE.Mesh>();

    constructor(map: MapGL, pluginOptions?: PluginOptions) {
        this.map = map;
        this.options = { ...this.options, ...pluginOptions };

        this.initLoader();

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

    public async addModels(models: ModelOptions[]) {
        await this.waitForThreeJsInit;

        const loadedModels = models.map((model) => {
            const {
                id,
                coordinates,
                modelPath,
                rotateX = 0,
                rotateY = 0,
                rotateZ = 0,
                scale = 1,
            } = model;
            const modelPosition = mapPointFromLngLat(coordinates);
            const modelUrl = concatUrl(this.options.modelsBaseUrl, modelPath);

            return new Promise<void>((resolve, reject) => {
                this.loader.load(
                    modelUrl,
                    (gltf: GLTF) => {
                        const model = new THREE.Mesh();
                        model.add(gltf.scene);

                        // rotation
                        model.rotateX(degToRad(rotateX));
                        model.rotateY(degToRad(rotateY));
                        model.rotateZ(degToRad(rotateZ));
                        // scaling
                        model.scale.set(scale, scale, scale);
                        // position
                        const mapPointCenter = [modelPosition[0], modelPosition[1], 0];
                        model.position.set(mapPointCenter[0], mapPointCenter[1], scale / 2);

                        const modelId = String(id);
                        try {
                            if (this.models.has(modelId)) {
                                throw new Error(
                                    `Model with id "${modelId}" already exists. Please use different identifiers for models`,
                                );
                            }
                        } catch (e) {
                            reject(e);
                            return;
                        }
                        this.models.set(modelId, model);

                        if (this.options.modelsLoadStrategy === 'dontWaitAll') {
                            this.scene.add(model);
                            this.map.triggerRerender();
                        }

                        resolve();
                    },
                    () => {},
                    (e) => {
                        reject(e);
                    },
                );
            });
        });

        return Promise.all(loadedModels).then(() => {
            if (this.options.modelsLoadStrategy === 'waitAll') {
                for (let [_id, model] of this.models) {
                    this.scene.add(model);
                }
                this.map.triggerRerender();
            }
        });
    }

    private render() {
        this.camera.projectionMatrix.fromArray(
            // TODO: TILES-5247 need to add public method
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
        this.camera = new THREE.PerspectiveCamera();

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.map.getCanvas(),
            context: this.map.getWebGLContext(),
            antialias: window.devicePixelRatio < 2,
        });
        this.renderer.autoClear = false;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.useLegacyLights = false;

        const { color, intencity } = this.options.ambientLight;
        const light = new THREE.AmbientLight(color, intencity);
        this.scene.add(light);

        this.onThreeJsInit();
    }

    private initLoader() {
        const loadingManager = new THREE.LoadingManager();
        const dracoLoader = new DRACOLoader(loadingManager).setDecoderPath(
            this.options.dracoScriptsUrl,
        );
        this.loader.setDRACOLoader(dracoLoader);
    }
}
