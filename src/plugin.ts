import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import type { Map as MapGL } from '@2gis/mapgl/types';

import { mapPointFromLngLat, degToRad, concatUrl, isAbsoluteUrl } from './utils';

/**
 * Options for an ambient light
 */
interface AmbientLightOptions {
    color: THREE.ColorRepresentation;
    intencity: number;
}

/**
 * Options for the plugin
 */
interface PluginOptions {
    /**
     * Settings for an ambient light
     */
    ambientLight?: AmbientLightOptions;
    /**
     * The url where scripts for the draco decoder are located
     */
    dracoScriptsUrl?: string;
    /**
     * The url which is used for resolving of a model's relative url
     */
    modelsBaseUrl?: string;
    /**
     * Strategies for the loading of models:
     * - dontWaitAll - show models as soon as possible
     * - waitAll - show models only when all models are ready for the rendering
     */
    modelsLoadStrategy?: 'dontWaitAll' | 'waitAll';
}

/**
 * Options for a model
 */
interface ModelOptions {
    /**
     * Identifier should be unique for every model
     */
    id: number | string;
    /**
     * Geographical coordinates [longitude, latitude]
     */
    coordinates: number[];
    /**
     * Url where the model is located
     */
    modelUrl: string;
    /**
     * Rotation of the model in degrees about the X axis
     */
    rotateX?: number;
    /**
     * Rotation of the model in degrees about the Y axis
     */
    rotateY?: number;
    /**
     * Rotation of the model in degrees about the Z axis
     */
    rotateZ?: number;
    /**
     * Scale of the model
     */
    scale?: number;
}

const defaultOptions: Required<PluginOptions> = {
    ambientLight: {
        color: 0xffffff,
        intencity: 2.9,
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
    private models = new Map<string, THREE.Mesh>();


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
     * @param models An array of models' options
     */
    public async addModels(models: ModelOptions[]) {
        await this.waitForThreeJsInit;

        const loadedModels = models.map((model) => {
            const {
                id,
                coordinates,
                modelUrl,
                rotateX = 0,
                rotateY = 0,
                rotateZ = 0,
                scale = 1,
            } = model;
            const modelPosition = mapPointFromLngLat(coordinates);

            let actualModelUrl = isAbsoluteUrl(modelUrl)
                ? modelUrl
                : concatUrl(this.options.modelsBaseUrl, modelUrl);

            return new Promise<void>((resolve, reject) => {
                this.loader.load(
                    actualModelUrl,
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
