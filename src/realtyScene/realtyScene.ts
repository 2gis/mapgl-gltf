import type { Map as MapGL, AnimationOptions, HtmlMarker, GeoJsonSource } from '@2gis/mapgl/types';

import { GltfPlugin } from '../plugin';
import { GltfFloorControl } from '../control';
import classes from './realtyScene.module.css';

import {
    ModelStatus,
    type BuildingState,
    type ModelOptions,
    type PluginOptions,
} from '../types/plugin';
import type {
    BuildingOptions,
    MapOptions,
    PopupOptions,
    BuildingOptionsInternal,
    BuildingFloorOptionsInternal,
    RealtySceneState,
} from '../types/realtyScene';
import type { FloorChangeEvent } from '../control/types';
import type { GltfPluginModelEvent, GltfPluginLabelEvent } from '../types/events';
import {
    GROUND_COVERING_SOURCE_DATA,
    GROUND_COVERING_SOURCE_PURPOSE,
    GROUND_COVERING_LAYER,
    GROUND_COVERING_LAYER_ID,
} from '../constants';
import {
    getBuildingModelOptions,
    getFloorModelId,
    getFloorModelOptions,
    getFloorPoiGroupId,
    isObject,
} from '../utils/realtyScene';

export class RealtyScene {
    private buildings = new Map<string, BuildingOptionsInternal>();
    private floors = new Map<string, BuildingFloorOptionsInternal>();
    private undergroundFloors = new Set<string>();
    private state: RealtySceneState = {
        activeModelId: undefined,
        buildingVisibility: new Map(),
        status: 'visible',
    };

    private groundCoveringSource: GeoJsonSource;
    private control: GltfFloorControl;
    private popup?: HtmlMarker;

    constructor(
        private plugin: GltfPlugin,
        private map: MapGL,
        private options: Required<PluginOptions>,
    ) {
        const { position } = this.options.floorsControl;
        this.control = new GltfFloorControl(this.map, { position });
        this.groundCoveringSource = new mapgl.GeoJsonSource(map, {
            maxZoom: 2,
            data: GROUND_COVERING_SOURCE_DATA,
            attributes: {
                purpose: GROUND_COVERING_SOURCE_PURPOSE,
            },
        });

        this.map.addLayer(GROUND_COVERING_LAYER);
        map.on('styleload', this.onStyleLoad);
    }

    private getBuildingModelId(id: string | undefined) {
        if (id === undefined) {
            return;
        }

        if (this.buildings.has(id)) {
            return id;
        } else {
            const floor = this.floors.get(id);
            if (floor) {
                return floor.buildingOptions.modelId;
            }
        }
    }

    private setState(newState: RealtySceneState) {
        if (this.state.status === 'destroyed') {
            return;
        }

        if (newState.status === 'destroyed') {
            this.state = newState;
            return;
        }

        const prevState = this.state;

        // т.к. стейт может меняться асинхронно и иногда нужно показывать
        // предыдущую модель некоторое время, реальный стейт заполняется тут,
        // а выставление нужного будет отложено на время загрузки модели
        const buildingVisibility: Map<string, ModelOptions | undefined> = new Map();

        this.buildings.forEach((_, buildingId) => {
            const prevModelOptions = prevState.buildingVisibility.get(buildingId);
            const newModelOptions = newState.buildingVisibility.get(buildingId);

            // если опции не изменились, то выставляем только опции карты, если модель активна
            if (
                prevModelOptions?.modelId === newModelOptions?.modelId &&
                prevState.status === newState.status
            ) {
                buildingVisibility.set(buildingId, prevModelOptions);

                if (prevModelOptions && prevModelOptions.modelId === newState.activeModelId) {
                    const options =
                        this.buildings.get(prevModelOptions.modelId) ??
                        this.floors.get(prevModelOptions.modelId);

                    if (options) {
                        this.setMapOptions(options.mapOptions);
                    }
                }

                return;
            }

            if (prevModelOptions) {
                // если нужно отобразить подземный этаж, но его модель не готова, то ничего не скрываем
                if (
                    !newModelOptions &&
                    newState.activeModelId !== undefined &&
                    this.undergroundFloors.has(newState.activeModelId) &&
                    this.plugin.getModelStatus(newState.activeModelId) !== ModelStatus.Loaded
                ) {
                    buildingVisibility.set(buildingId, prevModelOptions);
                } else if (
                    // если новая модель готова или предыдущую нужно просто скрыть, то скрываем ее
                    !newModelOptions ||
                    this.plugin.getModelStatus(newModelOptions.modelId) === ModelStatus.Loaded
                ) {
                    this.plugin.hideModel(prevModelOptions.modelId);
                    buildingVisibility.set(buildingId, undefined);

                    if (this.undergroundFloors.has(prevModelOptions.modelId)) {
                        this.switchOffGroundCovering();
                    }

                    const floorOptions = this.floors.get(prevModelOptions.modelId);
                    if (floorOptions) {
                        floorOptions.labelGroups?.forEach((group) => {
                            this.plugin.removeLabelGroup(group.id);
                        });
                    }
                }
            }

            if (newModelOptions) {
                // если текущий этаж - подземный, а новая активная модель не готова,
                // то не показываем модели, за исключанием подземного этажа
                if (
                    !prevModelOptions &&
                    prevState.activeModelId !== undefined &&
                    this.undergroundFloors.has(prevState.activeModelId) &&
                    newState.activeModelId !== undefined &&
                    this.plugin.getModelStatus(newState.activeModelId) !== ModelStatus.Loaded
                ) {
                    buildingVisibility.set(buildingId, prevModelOptions);
                } else {
                    const modelStatus = this.plugin.getModelStatus(newModelOptions.modelId);

                    // если новая модель готова, то показываем ее
                    if (modelStatus === ModelStatus.Loaded) {
                        buildingVisibility.set(buildingId, newModelOptions);

                        if (newState.status === 'visible') {
                            this.plugin.showModel(newModelOptions.modelId);

                            // если модель активна, то применяем опции карты и включаем подложку, если нужно
                            if (
                                newState.activeModelId !== undefined &&
                                newState.activeModelId === newModelOptions.modelId
                            ) {
                                const options =
                                    this.buildings.get(newModelOptions.modelId) ??
                                    this.floors.get(newModelOptions.modelId);

                                if (options) {
                                    this.setMapOptions(options.mapOptions);
                                }

                                if (this.undergroundFloors.has(newModelOptions.modelId)) {
                                    this.switchOnGroundCovering();
                                }

                                const floorOptions = this.floors.get(newModelOptions.modelId);
                                if (floorOptions) {
                                    floorOptions.labelGroups?.forEach((group) => {
                                        this.plugin.addLabelGroup(group, {
                                            buildingId,
                                            floorId: floorOptions.id,
                                        });
                                    });
                                }
                            }
                        }
                    } else {
                        if (modelStatus === ModelStatus.NoModel) {
                            this.plugin.addModel(newModelOptions, true).then(() => {
                                if (this.state.status === 'destroyed') {
                                    return;
                                }

                                if (this.state.activeModelId !== newModelOptions.modelId) {
                                    return;
                                }

                                // откладываем выставление нужного стейта до момента загрузки модели
                                this.setState({
                                    ...newState,
                                    status: this.state.status,
                                });
                            });
                        }

                        // если новые модели не готовы, то пока показываем предыдущие
                        buildingVisibility.set(buildingId, prevModelOptions);
                    }
                }
            }
        });

        // контрол реагирует на изменения стейта сразу, без учета загрузки модели, т.к. завязан на здание в целом
        const prevBuildingModelId = this.getBuildingModelId(prevState.activeModelId);
        const newBuildingModelId = this.getBuildingModelId(newState.activeModelId);

        if (prevBuildingModelId !== newBuildingModelId || prevState.status !== newState.status) {
            if (newState.status === 'hidden') {
                this.control.hide();
            } else if (newBuildingModelId !== undefined && newState.activeModelId !== undefined) {
                const buildingOptions = this.buildings.get(newBuildingModelId);
                if (buildingOptions) {
                    this.control.show({
                        buildingModelId: buildingOptions.modelId,
                        activeModelId: newState.activeModelId,
                        floorLevels: buildingOptions.floors.length
                            ? [
                                  {
                                      modelId: buildingOptions.modelId,
                                      icon: 'building',
                                      text: '',
                                  },
                                  ...buildingOptions.floors,
                              ]
                            : [],
                    });
                }
            }
        }

        this.state = {
            buildingVisibility,
            activeModelId: newState.activeModelId,
            status: newState.status,
        };
    }

    public async init(scene: BuildingOptions[], state?: BuildingState) {
        // Приводим стейт пользователя к внутреннему виду id
        let activeModelId: string | undefined = state
            ? state.floorId
                ? getFloorModelId(state.buildingId, state.floorId)
                : state.buildingId
            : undefined;

        scene.forEach((building) => {
            const { floors, ...buildingPart } = building;
            const internalBuilding: BuildingOptionsInternal = {
                ...buildingPart,
                floors: [],
            };
            const buildingOptions = getBuildingModelOptions(internalBuilding);

            (floors ?? []).forEach((floor) => {
                const floorModelId = getFloorModelId(building.modelId, floor.id);
                internalBuilding.floors.push({
                    modelId: floorModelId,
                    text: floor.text,
                    icon: floor.icon,
                });

                this.floors.set(floorModelId, {
                    ...floor,
                    labelGroups: (floor.labelGroups ?? []).map((group) => ({
                        ...group,
                        id: getFloorPoiGroupId(building.modelId, floor.id, group.id),
                    })),
                    buildingOptions: buildingOptions,
                });

                if (floor.isUnderground) {
                    this.undergroundFloors.add(floorModelId);
                }
            });

            this.buildings.set(building.modelId, internalBuilding);
        });

        // Оставляем только существующее значение из переданных modelId в scene
        activeModelId =
            activeModelId !== undefined &&
            (this.buildings.has(activeModelId) || this.floors.has(activeModelId))
                ? activeModelId
                : undefined;

        const modelsToLoad: Map<string, ModelOptions> = new Map();
        const buildingVisibility: Map<string, ModelOptions> = new Map();

        this.buildings.forEach((options, id) => {
            const modelOptions = getBuildingModelOptions(options);
            modelsToLoad.set(id, modelOptions);
            buildingVisibility.set(id, modelOptions);
        });

        if (activeModelId) {
            const floorOptions = this.floors.get(activeModelId);

            if (floorOptions) {
                if (this.undergroundFloors.has(activeModelId)) {
                    buildingVisibility.clear(); // показываем только подземный этаж
                }

                const modelOptions = getFloorModelOptions(floorOptions);
                buildingVisibility.set(floorOptions.buildingOptions.modelId, modelOptions);
                modelsToLoad.set(activeModelId, modelOptions);
            }
        }

        if (this.options.modelsLoadStrategy === 'waitAll') {
            this.floors.forEach((options, id) =>
                modelsToLoad.set(id, getFloorModelOptions(options)),
            );
        }

        return this.plugin
            .addModels(
                Array.from(modelsToLoad.values()),
                Array.from(buildingVisibility).map(([_, options]) => options.modelId),
            )
            .then(() => {
                if (this.state.status === 'destroyed') {
                    return;
                }

                this.setState({
                    activeModelId,
                    buildingVisibility,
                    status: this.state.status,
                });

                this.plugin.on('click', this.onSceneClick);
                this.plugin.on('mouseover', this.onSceneMouseOver);
                this.plugin.on('mouseout', this.onSceneMouseOut);
                this.control.on('floorchange', this.floorChangeHandler);
            });
    }

    public resetGroundCoveringColor() {
        const attrs = this.groundCoveringSource.getAttributes();
        if ('color' in attrs) {
            this.groundCoveringSource.setAttributes({
                ...attrs,
                color: this.options.groundCoveringColor,
            });
        }
    }

    public show() {
        if (this.state.status !== 'hidden') {
            return;
        }

        this.setState({
            ...this.state,
            status: 'visible',
        });
    }

    public hide() {
        if (this.state.status !== 'visible') {
            return;
        }

        this.setState({
            ...this.state,
            status: 'hidden',
        });
    }

    public destroy() {
        if (this.state.status === 'destroyed') {
            return;
        }

        this.setState({ ...this.state, status: 'destroyed' });
        this.map.off('styleload', this.onStyleLoad);
        this.plugin.off('click', this.onSceneClick);
        this.plugin.off('mouseover', this.onSceneMouseOver);
        this.plugin.off('mouseout', this.onSceneMouseOut);
        this.control.off('floorchange', this.floorChangeHandler);

        this.floors.forEach(({ labelGroups }) => {
            labelGroups?.forEach(({ id }) => {
                this.plugin.removeLabelGroup(id);
            });
        });
        this.plugin.removeModels([...this.buildings.keys(), ...this.floors.keys()]);
        this.map.removeLayer(GROUND_COVERING_LAYER_ID);

        this.groundCoveringSource.destroy();
        this.undergroundFloors.clear();

        this.control.destroy();

        this.popup?.destroy();
        this.popup = undefined;

        this.state.activeModelId = undefined;
        this.state.buildingVisibility.clear();
        this.buildings.clear();
        this.floors.clear();
    }

    private setMapOptions(options?: MapOptions) {
        if (!options) {
            return;
        }

        const animationOptions: AnimationOptions = {
            easing: 'easeInSine',
            duration: 500,
        };

        if (options.center) {
            this.map.setCenter(options.center, animationOptions);
        }
        if (options.pitch) {
            this.map.setPitch(options.pitch, animationOptions);
        }
        if (options.rotation) {
            this.map.setRotation(options.rotation, animationOptions);
        }
        if (options.zoom) {
            this.map.setZoom(options.zoom, animationOptions);
        }
    }

    private onStyleLoad = () => {
        this.map.addLayer(GROUND_COVERING_LAYER);
    };

    private onSceneMouseOut = (ev: GltfPluginLabelEvent | GltfPluginModelEvent) => {
        if (ev.target.type !== 'model') {
            return;
        }

        this.popup?.destroy();
    };

    private onSceneMouseOver = ({ target }: GltfPluginLabelEvent | GltfPluginModelEvent) => {
        if (target.type === 'label' || target.modelId === undefined) {
            return;
        }

        const options = this.buildings.get(target.modelId);
        if (!options || !options.popupOptions) {
            return;
        }

        this.popup = new mapgl.HtmlMarker(this.map, {
            coordinates: options.popupOptions.coordinates,
            html: getPopupHtml(options.popupOptions),
            interactive: false,
        });
    };

    private onSceneClick = ({ target }: GltfPluginLabelEvent | GltfPluginModelEvent) => {
        if (target.type === 'model') {
            const options = this.buildings.get(target.modelId);
            if (options) {
                this.buildingClickHandler(target.modelId);
            }
        } else if (target.type === 'label') {
            const userData = target.data.userData;
            if (isObject(userData) && typeof userData.url === 'string') {
                const a = document.createElement('a');
                a.setAttribute('href', userData.url);
                a.setAttribute('target', '_blank');
                a.click();
            }
        }
    };

    private floorChangeHandler = (ev: FloorChangeEvent) => {
        const buildingVisibility: Map<string, ModelOptions> = new Map();
        this.buildings.forEach((options, id) => {
            buildingVisibility.set(id, getBuildingModelOptions(options));
        });
        const buildingOptions = this.buildings.get(ev.modelId);
        if (buildingOptions) {
            this.setState({
                activeModelId: ev.modelId,
                buildingVisibility,
                status: this.state.status,
            });
            return;
        }

        const floorOptions = this.floors.get(ev.modelId);
        if (floorOptions) {
            if (this.undergroundFloors.has(ev.modelId)) {
                buildingVisibility.clear();
            }
            buildingVisibility.set(
                floorOptions.buildingOptions.modelId,
                getFloorModelOptions(floorOptions),
            );
            this.setState({
                activeModelId: ev.modelId,
                buildingVisibility,
                status: this.state.status,
            });
            return;
        }
    };

    private buildingClickHandler = (modelId: string) => {
        const buildingOptions = this.buildings.get(modelId);
        if (!buildingOptions) {
            return;
        }

        let activeModelId = modelId;
        const buildingVisibility: Map<string, ModelOptions> = new Map();
        this.buildings.forEach((options, id) => {
            buildingVisibility.set(id, getBuildingModelOptions(options));
        });

        // показываем самый высокий этаж здания после клика
        const floors = buildingOptions.floors ?? [];
        if (floors.length) {
            const { modelId: floorModelId } = floors[floors.length - 1];
            const floorOptions = this.floors.get(floorModelId);
            if (floorOptions) {
                activeModelId = floorModelId;
                if (this.undergroundFloors.has(floorModelId)) {
                    buildingVisibility.clear();
                }
                buildingVisibility.set(
                    floorOptions.buildingOptions.modelId,
                    getFloorModelOptions(floorOptions),
                );
            }
        }

        this.setState({
            buildingVisibility,
            activeModelId,
            status: this.state.status,
        });
    };

    private switchOffGroundCovering() {
        const attrs = { ...this.groundCoveringSource.getAttributes() };
        delete attrs['color'];
        this.groundCoveringSource.setAttributes(attrs);
    }

    private switchOnGroundCovering() {
        this.groundCoveringSource.setAttributes({
            ...this.groundCoveringSource.getAttributes(),
            color: this.options.groundCoveringColor,
        });
    }
}

const getPopupHtml = ({ description, title }: PopupOptions) =>
    `<div class="${classes.popup}">
        <h2>${title}</h2>
        ${description ? `<p>${description}</p>` : ''}
    </div>`;
