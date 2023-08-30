import * as THREE from 'three';
import type { Map as MapGL } from '@2gis/mapgl/types';

import { Evented } from './external/evented';
import { EventSource } from './eventSource';
import { Loader } from './loader';
import { PoiGroups } from './poiGroups';
import { RealtyScene } from './realtyScene/realtyScene';
import { defaultOptions } from './defaultOptions';

import type {
    Id,
    PluginOptions,
    ModelOptions,
    BuildingState,
    PoiGroupOptions,
} from './types/plugin';
import type { BuildingOptions } from './types/realtyScene';
import type { GltfPluginEventTable } from './types/events';

export class GltfPlugin extends Evented<GltfPluginEventTable> {
    private isThreeJsInitialized = false;
    private renderer = new THREE.WebGLRenderer();
    private camera = new THREE.PerspectiveCamera();
    private scene = new THREE.Scene();
    private tmpMatrix = new THREE.Matrix4();

    private viewport: DOMRect;
    private map: MapGL;
    private options = defaultOptions;
    private loader: Loader;
    private poiGroups: PoiGroups;
    private eventSource?: EventSource;
    private onPluginInit = () => {}; // resolve of waitForPluginInit
    private waitForPluginInit = new Promise<void>((resolve) => (this.onPluginInit = resolve));
    private models;
    private realtyScene?: RealtyScene;
    private modelOptions = new Map<string, ModelOptions>();

    private linkedIds = new Set<string>();

    /**
     * The main class of the plugin
     *
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
     *         modelId: '03a234cb',
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
        super();

        this.map = map;
        this.options = { ...this.options, ...pluginOptions };

        this.viewport = this.map.getContainer().getBoundingClientRect();

        this.loader = new Loader({
            modelsBaseUrl: this.options.modelsBaseUrl,
            dracoScriptsUrl: this.options.dracoScriptsUrl,
        });
        this.loader.setHoverParams(this.options.hoverHighlight);
        this.models = this.loader.getModels();

        this.poiGroups = new PoiGroups(this.map, this.options.poiConfig);

        this.map.once('idle', () => {
            this.initEventHandlers();
        });

        this.map.on('styleload', () => {
            const hiddenIds = Array.from(this.linkedIds);
            if (hiddenIds.length) {
                this.map.setHiddenObjects(hiddenIds);
            }

            this.addThreeJsLayer();
            this.poiGroups.onMapStyleUpdate();
        });
    }

    private setLinkedIds(modelOptions: ModelOptions[], ids?: Id[]) {
        modelOptions.forEach(({ modelId, linkedIds }) => {
            if (linkedIds?.length && (!ids || ids.some((id) => id === modelId))) {
                linkedIds.forEach((id) => this.linkedIds.add(id));
            }
        });
    }

    private getLinkedIds() {
        return Array.from(this.linkedIds);
    }

    // private resetLinkedIds() {
    //     this.linkedIds = new Set();
    // }

    /**
     * Add the list of models to the map partially
     * Use this method if you want to add to the map
     * some models from the list of models and want
     * to preserve remaining ones in the cache without
     * adding them to the map
     *
     * @param modelOptions An array of models' options
     * @param ids An array of identifiers of the models that must be added to the scene
     */
    public async addModelsPartially(modelOptions: ModelOptions[], ids: Id[]) {
        await this.waitForPluginInit;

        this.setLinkedIds(modelOptions, ids);

        const loadedModels = this.startModelLoading(modelOptions, ids);

        return Promise.all(loadedModels).then(() => {
            for (let options of modelOptions) {
                this.modelOptions.set(String(options.modelId), options);
            }

            if (this.options.modelsLoadStrategy === 'waitAll') {
                this.map.setHiddenObjects(this.getLinkedIds());
                for (let id of ids) {
                    this.addModelFromCache(id);
                }
                this.map.triggerRerender();
            }

            this.invalidateViewport();
        });
    }

    /**
     * Add the list of models to the map
     * Use this method if you want to add
     * a list of models to the map at the same time
     *
     * @param modelOptions An array of models' options
     */
    public async addModels(modelOptions: ModelOptions[]) {
        return this.addModelsPartially(
            modelOptions,
            modelOptions.map((opt) => opt.modelId),
        );
    }

    /**
     * Add model to the map
     *
     * @param modelOptions The models' options
     */
    public async addModel(modelOptions: ModelOptions) {
        await this.waitForPluginInit;

        this.setLinkedIds([modelOptions]);

        return this.loader.loadModel(modelOptions).then(() => {
            this.modelOptions.set(String(modelOptions.modelId), modelOptions);
            if (modelOptions.linkedIds) {
                this.map.setHiddenObjects(modelOptions.linkedIds);
            }
            this.addModelFromCache(modelOptions.modelId);
            this.map.triggerRerender();
            this.invalidateViewport();
        });
    }

    /**
     * Remove the model from the map and cache or from the map only
     *
     * @param id Identifier of the model to delete
     * @param preserveCache Flag to keep the model in the cache
     */
    public removeModel(id: Id, preserveCache?: boolean) {
        const model = this.models.get(String(id));
        if (model === undefined) {
            return;
        }
        this.scene.remove(model);
        if (!preserveCache) {
            const options = this.modelOptions.get(String(id));
            if (options !== undefined && options.linkedIds !== undefined) {
                this.map.unsetHiddenObjects(options.linkedIds);
            }
            this.models.delete(String(id));
            this.disposeObject(model);
        }
        this.map.triggerRerender();
    }

    /**
     * Add the group of poi to the map
     *
     * @param options Options of the group of poi to add to the map
     * @param state State of the active building to connect with added the group of poi
     */
    public async addPoiGroup(options: PoiGroupOptions, state?: BuildingState) {
        await this.waitForPluginInit;

        this.poiGroups.add(options, state);
    }

    /**
     * Remove the group of poi from the map
     *
     * @param id Identifier of the group of poi to remove
     */
    public removePoiGroup(id: Id) {
        this.poiGroups.remove(id);
    }

    /**
     * Add the interactive realty scene to the map
     *
     * @param scene The options of the scene to add to the map
     * @param state State of the active building to connect with added scene
     */
    public async addRealtyScene(scene: BuildingOptions[], state?: BuildingState) {
        await this.waitForPluginInit;
        if (!this.eventSource) {
            return;
        }

        this.realtyScene = new RealtyScene(
            this,
            this.map,
            this.eventSource,
            this.models,
            this.options,
        );

        return this.realtyScene.addRealtyScene(scene, state);
    }

    private invalidateViewport() {
        const container = this.map.getContainer();
        this.viewport = container.getBoundingClientRect();
        this.eventSource?.updateViewport(this.viewport);
    }

    private initEventHandlers() {
        this.map.on('resize', () => {
            this.invalidateViewport();
        });

        window.addEventListener('resize', () => {
            this.invalidateViewport();
        });

        this.eventSource = new EventSource(this.map, this.viewport, this.camera, this.scene);
        for (let eventName of this.eventSource.getEvents()) {
            this.eventSource.on(eventName, (e) => {
                this.emit(eventName, e);
            });
        }
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

        // setViewport discards the same settings
        // so it has no effect on performance
        this.renderer.setViewport(
            0,
            0,
            this.viewport.width * window.devicePixelRatio,
            this.viewport.height * window.devicePixelRatio,
        );

        this.renderer.render(this.scene, this.camera);
    }

    private initThree() {
        if (this.isThreeJsInitialized) {
            return false;
        }

        this.isThreeJsInitialized = true;

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

        this.onPluginInit();
    }

    private addThreeJsLayer() {
        this.map.addLayer({
            id: 'gltf-plugin-style-layer',
            type: 'custom',
            onAdd: () => this.initThree(),
            render: () => this.render(),
            onRemove: () => {},
        });
    }

    private startModelLoading(modelOptions: ModelOptions[], ids?: Id[]) {
        return modelOptions.map((options) => {
            return this.loader.loadModel(options).then(() => {
                if (this.options.modelsLoadStrategy === 'dontWaitAll') {
                    if (ids === undefined || ids.includes(options.modelId)) {
                        if (options.linkedIds) {
                            this.map.setHiddenObjects(options.linkedIds);
                        }
                        this.addModelFromCache(options.modelId);
                        this.map.triggerRerender();
                    }
                }
            });
        });
    }

    private addModelFromCache(id: Id) {
        const model = this.models.get(String(id));
        if (model !== undefined) {
            this.scene.add(model);
        }
        return Boolean(model);
    }

    /**
     * Delete from memory all allocated objects by Object3D
     * https://threejs.org/docs/#manual/en/introduction/How-to-dispose-of-objects
     */
    private disposeObject(inputObj: THREE.Object3D) {
        inputObj.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
                const geometry = obj.geometry;
                const material = obj.material;

                if (geometry) {
                    geometry.dispose();
                }

                if (material) {
                    const texture = material.map;

                    if (texture) {
                        texture.dispose();
                    }

                    material.dispose();
                }
            }
        });
    }
}
