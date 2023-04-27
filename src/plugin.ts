import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import type { Map as MapGL } from '@2gis/mapgl/types';

import { mapPointFromLngLat, degToRad, concatUrl, isAbsoluteUrl } from './utils';
import { PluginOptions, ModelOptions } from './types';

const defaultOptions: Required<PluginOptions> = {
    ambientLight: {
        color: '#ffffff',
        intencity: 1,
    },
    dracoScriptsUrl: 'https://unpkg.com/@2gis/mapgl-gltf@^1/dist/libs/draco/',
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
    private models = new Map<string, THREE.Object3D>();
    private sources = new Map<string, GLTF>();

    /**
     * Example:
     * ```js
     * const plugin = new GltfPlugin (map, {
     *     modelsLoadStrategy: 'waitAll',
     *     dracoScriptsUrl: 'libs/draco/',
     *     ambientLight: { color: 'white', intencity: 2.5 },
     * });
     *
     * plugin.addModels([
     *     {
     *         id: 1,
     *         coordinates: [82.886554, 54.980988],
     *         modelUrl: 'models/cube_draco.glb',
     *         rotateX: 90,
     *         scale: 1000,
     *     },
     * ]);
     * ```
     * @param map The map instance
     * @param pluginOptions GltfPlugin initialization options
     */
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

    /**
     * Add models to the map
     *
     * @param modelOptions An array of models' options
     */
    public async addModels(modelOptions: ModelOptions[]) {
        await this.waitForThreeJsInit;

        const loadedModels = modelOptions.map((options) => {
            const {
                id,
                coordinates,
                modelUrl,
                linkedIds,
                rotateX = 0,
                rotateY = 0,
                rotateZ = 0,
                scale = 1,
            } = options;
            const modelPosition = mapPointFromLngLat(coordinates);

            let actualModelUrl = isAbsoluteUrl(modelUrl)
                ? modelUrl
                : concatUrl(this.options.modelsBaseUrl, modelUrl);

            return new Promise<void>((resolve, reject) => {
                this.loader.load(
                    actualModelUrl,
                    (gltf: GLTF) => {
                        const model = new THREE.Object3D();
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
                        this.sources.set(modelId, gltf);

                        if (this.options.modelsLoadStrategy === 'dontWaitAll') {
                            if (linkedIds) {
                                this.map.setHiddenObjects(linkedIds);
                            }
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
                for (let options of modelOptions) {
                    if (options.linkedIds) {
                        this.map.setHiddenObjects(options.linkedIds);
                    }
                }
                for (let [_id, model] of this.models) {
                    this.scene.add(model);
                }
                this.map.triggerRerender();
            }
        });
    }

    public getModel(id: number) {
        return this.models.get(String(id));
    }

    public getSource(id: number) {
        return this.sources.get(String(id));
    }

    private render() {
        this.camera.projectionMatrix.fromArray(this.map.getProjectionMatrixForGltfPlugin());
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
