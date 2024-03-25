import type { Map as MapGL } from '@2gis/mapgl/types';
import type { BuildingOptions } from './types/realtyScene';
import type { GltfPluginEventTable } from './types/events';
import type { Id, PluginOptions, ModelOptions, BuildingState } from './types/plugin';

import { applyOptionalDefaults } from './utils/common';
import { Evented } from './external/evented';
import { defaultOptions } from './defaultOptions';
import { concatUrl, isAbsoluteUrl } from './utils/url';
import { createModelEventData } from './utils/events';
import { RealtyScene } from './realtyScene/realtyScene';
import { GROUND_COVERING_LAYER } from './constants';
import { ModelStatus } from './types/plugin';

interface Model {
    instance: any; // GltfModel
    options: ModelOptions;
    isLoaded: boolean;
}

const MODEL_DEFAULTS = {
    scale: 1,
    rotation: 0,
    offset: 0,
    linkedIds: [],
    interactive: false,
};

export class GltfPlugin extends Evented<GltfPluginEventTable> {
    private map: MapGL;
    private options: Required<PluginOptions>;
    private models: Map<Id, Model>;
    private realtyScene?: RealtyScene;

    /**
     * The main class of the plugin
     *
     * Example:
     * ```js
     * const plugin = new GltfPlugin (map, {
     *     modelsLoadStrategy: 'waitAll',
     *     ambientLight: { color: 'white', intencity: 2.5 },
     * });
     *
     * plugin.addModels([
     *     {
     *         modelId: '03a234cb',
     *         coordinates: [82.886554, 54.980988],
     *         modelUrl: 'models/cube_draco.glb',
     *         rotateZ: 90,
     *         scale: 2,
     *     },
     * ]);
     * ```
     * @param map The map instance
     * @param pluginOptions GltfPlugin initialization options
     */
    constructor(map: MapGL, pluginOptions?: PluginOptions) {
        super();

        this.map = map;
        this.options = applyOptionalDefaults(pluginOptions ?? {}, defaultOptions);
        this.models = new Map();

        map.on('styleload', () => {
            this.map.addLayer(GROUND_COVERING_LAYER); // мб унести отсюда в RealtyScene, нужно подумать
            // this.poiGroups.onMapStyleUpdate();
        });
    }

    // public destroy() {}

    public setOptions(pluginOptions: Pick<Required<PluginOptions>, 'groundCoveringColor'>) {
        Object.keys(pluginOptions).forEach((option) => {
            switch (option) {
                case 'groundCoveringColor': {
                    this.options.groundCoveringColor = pluginOptions.groundCoveringColor;
                    this.realtyScene?.resetGroundCoveringColor();
                    break;
                }
            }
        });
    }

    public async addModel(modelToLoad: ModelOptions, hideOnLoad = false) {
        return this.addModels([modelToLoad], hideOnLoad ? [] : [modelToLoad.modelId]);
    }

    public async addModels(modelsToLoad: ModelOptions[], modelIdsToShow?: Id[]) {
        const loadingModels = modelsToLoad
            .filter((options) => {
                if (this.models.has(options.modelId)) {
                    console.error(
                        `A model with id ${options.modelId} already exists. The new model won't be added.`,
                    );
                    return false;
                }

                return true;
            })
            .map((options) => {
                const modelSrc = isAbsoluteUrl(options.modelUrl)
                    ? options.modelUrl
                    : concatUrl(this.options.modelsBaseUrl, options.modelUrl);

                const instance = new mapgl.GltfModel(this.map, {
                    coordinates: options.coordinates,
                    modelSrc,
                    scale: options.scale ?? MODEL_DEFAULTS.scale,
                    rotation: [
                        options.rotateX ?? MODEL_DEFAULTS.rotation,
                        options.rotateY ?? MODEL_DEFAULTS.rotation,
                        options.rotateZ ?? MODEL_DEFAULTS.rotation,
                    ],
                    offset: [
                        options.offsetX ?? MODEL_DEFAULTS.offset,
                        options.offsetY ?? MODEL_DEFAULTS.offset,
                        options.offsetZ ?? MODEL_DEFAULTS.offset,
                    ],
                    linkedIds: options.linkedIds ?? MODEL_DEFAULTS.linkedIds,
                    interactive: options.interactive ?? MODEL_DEFAULTS.interactive,
                    userData: options.userData,
                    hideOnInit:
                        this.options.modelsLoadStrategy === 'waitAll' ||
                        (modelIdsToShow && !modelIdsToShow.includes(options.modelId)),
                    hover: {
                        color: this.options.hoverOptions.color,
                    },
                    disableAnimation: true,
                });

                const model: Model = {
                    options,
                    instance,
                    isLoaded: false,
                };

                this.models.set(options.modelId, model);

                return new Promise<Model>((resolve) => {
                    instance.once('modelloaded', () => {
                        model.isLoaded = true;
                        resolve(model);
                    });
                    (['click', 'mousemove', 'mouseover', 'mouseout'] as const).forEach(
                        (eventType) => {
                            instance.on(eventType, (ev) => {
                                this.emit(eventType, createModelEventData(ev, options));
                            });
                        },
                    );
                });
            });

        return Promise.all(loadingModels).then((loadedModels) => {
            if (this.options.modelsLoadStrategy !== 'waitAll') {
                return;
            }

            loadedModels.forEach((model) => {
                if (!modelIdsToShow || modelIdsToShow.includes(model.options.modelId)) {
                    model.instance.show();
                }
            });
        });
    }

    public getModelStatus(id: Id) {
        const model = this.models.get(id);
        if (!model) {
            return ModelStatus.NoModel;
        }

        return !model.isLoaded ? ModelStatus.Loading : ModelStatus.Loaded;
    }

    public removeModel(id: Id) {
        const model = this.models.get(id);
        if (model) {
            model.instance.destroy();
            this.models.delete(id);
        }
    }

    public removeModels(ids: Id[]) {
        ids.forEach((id) => this.removeModel(id));
    }

    public showModel(id: Id) {
        this.models.get(id)?.instance.show();
    }

    public showModels(ids: Id[]) {
        ids.forEach((id) => this.showModel(id));
    }

    public hideModel(id: Id) {
        this.models.get(id)?.instance.hide();
    }

    public hideModels(ids: Id[]) {
        ids.forEach((id) => this.hideModel(id));
    }

    public async addRealtyScene(scene: BuildingOptions[], state?: BuildingState) {
        this.realtyScene = new RealtyScene(this, this.map, this.options);
        return this.realtyScene.init(scene, state);
    }

    // public showRealtyScene() {}

    // public hideRealtyScene() {}

    public removeRealtyScene() {
        this.realtyScene?.destroy();
        this.realtyScene = undefined;
    }
}
