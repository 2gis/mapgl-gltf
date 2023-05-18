import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import type { Map as MapGL, GeoJsonSource } from '@2gis/mapgl/types';
import type { FeatureCollection } from 'geojson';

import { mapPointFromLngLat, degToRad, concatUrl, isAbsoluteUrl, geoToMapDistance } from './utils';
import { PluginOptions, ModelOptions } from './types';

const defaultOptions: Required<PluginOptions> = {
    ambientLight: {
        color: '#ffffff',
        intencity: 1,
    },
    dracoScriptsUrl: 'https://unpkg.com/@2gis/mapgl-gltf@^1/dist/libs/draco/',
    modelsBaseUrl: '',
    modelsLoadStrategy: 'waitAll',
    poiConfig: {
        primary: {
            fontSize: 14,
            fontColor: '#000000',
        },
        secondary: {
            fontSize: 14,
            fontColor: '#000000',
        }
    }
};

export class GltfPlugin {
    private renderer = new THREE.WebGLRenderer();
    private camera = new THREE.PerspectiveCamera();
    private scene = new THREE.Scene();
    private tmpMatrix = new THREE.Matrix4();
    private map: MapGL;
    private options = defaultOptions;
    private loader = new GLTFLoader();
    private onPluginInit = () => {}; // resolve of waitForPluginInit
    private waitForPluginInit = new Promise<void>((resolve) => (this.onPluginInit = resolve));
    private models = new Map<string, THREE.Object3D>();
    private poiSources = new Map<string, GeoJsonSource>();

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
            this.addStyleLayers();
        });
    }

    /**
     * Add models to the map
     *
     * @param modelOptions An array of models' options
     */
    public async addModels(modelOptions: ModelOptions[]) {
        await this.waitForPluginInit;

        const loadedModels = modelOptions.map((options) => {
            return this.loadModel(options).then(() => {
                if (this.options.modelsLoadStrategy === 'dontWaitAll') {
                    if (options.linkedIds) {
                        this.map.setHiddenObjects(options.linkedIds);
                    }

                    const model = this.models.get(String(options.id));
                    if (model !== undefined) {
                        this.scene.add(model);
                    }
                    this.map.triggerRerender();
                }
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

    public async addModel(options: ModelOptions) {
        await this.waitForPluginInit;
        return this.loadModel(options).then(() => {
            if (options.linkedIds) {
                this.map.setHiddenObjects(options.linkedIds);
            }

            const model = this.models.get(String(options.id));
            if (model !== undefined) {
                this.scene.add(model);
            }
            this.map.triggerRerender();
        });
    }

    public removeModel(id: string | number) {
        const model = this.models.get(String(id));
        if (model === undefined) {
            return;
        }
        this.scene.remove(model);
        this.map.triggerRerender();
    }

    public async addPoiGroup({
        id,
        type,
        data,
        minZoom = -Infinity,
        maxZoom = +Infinity,
    }: {
        id: string | number;
        type: 'primary' | 'secondary';
        data: FeatureCollection;
        minZoom?: number;
        maxZoom?: number;
    }) {
        await this.waitForPluginInit;

        const actualId = String(id);
        if (this.poiSources.get(actualId) !== undefined) {
            throw new Error(
                `Poi group with id "${actualId}" already exists. Please use different identifiers for poi groups`,
            );
        }

        // create source with poi
        const source = new mapgl.GeoJsonSource(this.map, {
            data: data,
            attributes: {
                dataType: actualId,
            }
        });
        this.poiSources.set(actualId, source)

        // add style layer for poi
        this.addPoiStyleLayer(actualId, type, minZoom, maxZoom);
    }

    public removePoiGroup(id: string | number) {
        const source = this.poiSources.get(String(id));
        source?.destroy();
        this.map.removeLayer('plugin-poi-' + String(id));
    }

    private loadModel(modelOptions: ModelOptions) {
        const {
            id,
            coordinates,
            modelUrl,
            rotateX = 0,
            rotateY = 0,
            rotateZ = 0,
            scale = 1,
            offsetX = 0,
            offsetY = 0,
            offsetZ = 0,
        } = modelOptions;
        const modelPosition = mapPointFromLngLat(coordinates);
        const mapPointsOffsetX = geoToMapDistance(coordinates, offsetX);
        const mapPointsOffsetY = geoToMapDistance(coordinates, offsetY);
        const mapPointsOffsetZ = geoToMapDistance(coordinates, offsetZ);

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
                    const mapPointCenter = [
                        modelPosition[0] + mapPointsOffsetX,
                        modelPosition[1] + mapPointsOffsetY,
                        mapPointsOffsetZ,
                    ];
                    model.position.set(mapPointCenter[0], mapPointCenter[1], mapPointCenter[2]);

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

                    resolve();
                },
                () => {},
                (e) => {
                    reject(e);
                },
            );
        });
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

        this.onPluginInit();
    }

    private initLoader() {
        const loadingManager = new THREE.LoadingManager();
        const dracoLoader = new DRACOLoader(loadingManager).setDecoderPath(
            this.options.dracoScriptsUrl,
        );
        this.loader.setDRACOLoader(dracoLoader);
    }

    private addStyleLayers() {
        this.map.addIcon('km_pillar_gray_border', {
            url: 'https://disk.2gis.com/styles/d7e8aed1-4d3f-472a-a1e4-337f4b31ab8a/km_pillar_gray_border',
            // @ts-ignore
            width: 38,
            height: 38,
            stretchX: [[4, 24]],
            stretchY: [[4, 24]]
        });

        this.map.addIcon('no_image', {
            // TODO: need to add empty svg
            url: 'https://disk.2gis.com/styles/d7e8aed1-4d3f-472a-a1e4-337f4b31ab8a/empty',
        });

        this.map.addLayer({
            id: 'threeJsLayer',
            type: 'custom',
            onAdd: () => this.initThree(),
            render: () => this.render(),
            onRemove: () => {},
        });
    }

    private addPoiStyleLayer(
        id: string,
        type: 'primary' | 'secondary',
        minzoom: number,
        maxzoom: number
    ) {
        const isPrimary = type === 'primary';
        const iconPriority = isPrimary ? 7000 : 6000;
        const iconLabelingGroup = isPrimary ? '__overlappedPrimary' : '__overlappedSecondary';
        const iconImage = isPrimary ? 'km_pillar_gray_border' : 'no_image';
        const iconTextColor = isPrimary
            ? this.options.poiConfig.primary?.fontColor
            : this.options.poiConfig.secondary?.fontColor;
        const iconTextFontSize = isPrimary
            ? this.options.poiConfig.primary?.fontSize
            : this.options.poiConfig.secondary?.fontSize;

        this.map.addLayer({
            type: 'point',
            id: 'plugin-poi-' + id,
            filter: [
                'all',
                ['match', ['sourceAttr', 'dataType'], [id], true, false],
                ['match', ['get', 'type'], ['immersive_poi'], true, false],
            ],
            style: {
                iconPriority,
                iconLabelingGroup,
                allowElevation: true,
                elevation: ['get', 'elevation'],
                iconImage,
                iconAnchor: [0.5, 1],
                iconOffset: [0, 0],
                iconTextFont: 'Noto_Sans',
                iconTextColor,
                iconTextField: ['get', 'label'],
                iconTextPadding: [5, 10, 5, 10],
                iconTextFontSize,
                duplicationSpacing: 1,
            },
            minzoom,
            maxzoom,
        });
    }
}
