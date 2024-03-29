import type { DynamicObjectEventTable, GltfModel, Map as MapGL } from '@2gis/mapgl/types';
import type { BuildingOptions } from './types/realtyScene';
import type { GltfPluginEventTable } from './types/events';
import type { PluginOptions, ModelOptions, BuildingState, LabelGroupOptions } from './types/plugin';

import { applyOptionalDefaults } from './utils/common';
import { Evented } from './external/evented';
import { defaultOptions } from './defaultOptions';
import { concatUrl, isAbsoluteUrl } from './utils/url';
import { createModelEventData } from './utils/events';
import { RealtyScene } from './realtyScene/realtyScene';
import { ModelStatus } from './types/plugin';
import { pluginEvents } from './constants';
import { LabelGroups } from './labelGroups';

interface Model {
    instance: GltfModel;
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
    private models: Map<string, Model>;
    private labelGroups: LabelGroups;
    private realtyScene?: RealtyScene;
    private isDestroyed = false;

    /**
     * The main class of the plugin.
     *
     * Example:
     * ```js
     * const plugin = new GltfPlugin(map, {
     *     modelsLoadStrategy: 'waitAll',
     *     modelsBaseUrl: 'https://url_to_models',
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
     * @param map The map instance.
     * @param pluginOptions GltfPlugin initialization options.
     */
    constructor(map: MapGL, pluginOptions?: PluginOptions) {
        super();

        this.map = map;
        this.options = applyOptionalDefaults(pluginOptions ?? {}, defaultOptions);
        this.models = new Map();
        this.labelGroups = new LabelGroups(this.map, this, this.options);
    }

    /**
     * Destroys the plugin.
     */
    public destroy() {
        this.isDestroyed = true;
        this.models.forEach((model) => {
            model.instance.destroy();
        });
        this.models.clear();
        this.labelGroups.destroy();
        this.realtyScene?.destroy();
    }

    /**
     * Sets options of the plugin.
     *
     * @param pluginOptions Plugin options that are available for setting.
     */
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

    /**
     * Adds a model to the map.
     *
     * @param modelToLoad Options of a model.
     * @param hideOnLoad Set to `true` if a model should be hidden on loading completion.
     */
    public async addModel(modelToLoad: ModelOptions, hideOnLoad = false) {
        return this.addModels([modelToLoad], hideOnLoad ? [] : [modelToLoad.modelId]);
    }

    /**
     * Adds a list of models to the map.
     *
     * @param modelsToLoad An array of options of models.
     * @param modelIdsToShow An array of ids of models that should be shown. If it's not provided
     * all models will be shown.
     */
    public async addModels(modelsToLoad: ModelOptions[], modelIdsToShow?: string[]) {
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
                    zIndex: this.options.zIndex,
                });

                const model: Model = {
                    options,
                    instance,
                    isLoaded: false,
                };

                this.models.set(options.modelId, model);

                return new Promise<Model>((resolve) => {
                    instance.once('modelloaded' as keyof DynamicObjectEventTable, () => {
                        model.isLoaded = true;
                        resolve(model);
                    });
                    pluginEvents.forEach((eventType) => {
                        instance.on(eventType, (ev) => {
                            this.emit(eventType, createModelEventData(ev, options));
                        });
                    });
                });
            });

        return Promise.all(loadingModels).then((loadedModels) => {
            if (this.isDestroyed) {
                return;
            }

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

    /**
     * Returns a current status of a model.
     * There can be no model or it can be loading or loaded.
     *
     * @param id A model id.
     */
    public getModelStatus(id: string) {
        const model = this.models.get(id);
        if (!model) {
            return ModelStatus.NoModel;
        }

        return !model.isLoaded ? ModelStatus.Loading : ModelStatus.Loaded;
    }

    /**
     * Removes a model from the map.
     *
     * @param id A model id.
     */
    public removeModel(id: string) {
        const model = this.models.get(id);
        if (model) {
            model.instance.destroy();
            this.models.delete(id);
        }
    }

    /**
     * Removes models from the map.
     *
     * @param id Model ids.
     */
    public removeModels(ids: string[]) {
        ids.forEach((id) => this.removeModel(id));
    }

    /**
     * Shows a model on the map.
     *
     * @param id A model id.
     */
    public showModel(id: string) {
        this.models.get(id)?.instance.show();
    }

    /**
     * Shows models on the map.
     *
     * @param id Model ids.
     */
    public showModels(ids: string[]) {
        ids.forEach((id) => this.showModel(id));
    }

    /**
     * Hides a model on the map.
     *
     * @param id A model id.
     */
    public hideModel(id: string) {
        this.models.get(id)?.instance.hide();
    }

    /**
     * Hides models on the map.
     *
     * @param id Model ids.
     */
    public hideModels(ids: string[]) {
        ids.forEach((id) => this.hideModel(id));
    }

    /**
     * Adds a group of labels to the map.
     *
     * @param options Options of the group of labels.
     * @param state A state of active building and floor a group of labels is associated with.
     */
    public addLabelGroup(options: LabelGroupOptions, state?: BuildingState) {
        this.labelGroups.add(options, state);
    }

    /**
     * Removes a group of labels from the map.
     *
     * @param id A label group id.
     */
    public removeLabelGroup(id: string) {
        this.labelGroups.remove(id);
    }

    /**
     * Adds an interactive realty scene to the map.
     *
     * @param scene Options of the scene to add to the map.
     * @param state A state of building and floor that should be active on realty scene initialization.
     */
    public async addRealtyScene(scene: BuildingOptions[], state?: BuildingState) {
        this.realtyScene = new RealtyScene(this, this.map, this.options);
        return this.realtyScene.init(scene, state);
    }

    /**
     * Removes an interactive realty scene from the map.
     */
    public removeRealtyScene() {
        this.realtyScene?.destroy();
        this.realtyScene = undefined;
    }
}
