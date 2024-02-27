import type { Map as MapGL, AnimationOptions, HtmlMarker, GeoJsonSource } from '@2gis/mapgl/types';

import { GltfPlugin } from '../plugin';
import { GltfFloorControl } from '../control';
import classes from './realtyScene.module.css';

import type { Id, ModelOptions, PluginOptions } from '../types/plugin';
import type {
    BuildingOptions,
    MapOptions,
    BuildingFloorOptions,
    PopupOptions,
} from '../types/realtyScene';
import type { FloorLevel, FloorChangeEvent } from '../control/types';
import type {
    GltfPluginModelEvent,
    GltfPluginPoiEvent,
    PoiGeoJsonProperties,
} from '../types/events';
import {
    GROUND_COVERING_LAYER,
    GROUND_COVERING_SOURCE_DATA,
    GROUND_COVERING_SOURCE_PURPOSE,
} from '../constants';

interface RealtySceneState {
    activeModelId?: Id;

    // id здания мапится на опции здания или опции этажа этого здания
    buildingVisibility: Map<Id, ModelOptions | undefined>;
}

type BuildingOptionsInternal = Omit<BuildingOptions, 'floors'> & {
    floors: FloorLevel[];
};
type BuildingFloorOptionsInternal = BuildingFloorOptions & {
    buildingOptions: ModelOptions;
};

export class RealtyScene {
    private buildings = new Map<Id, BuildingOptionsInternal>();
    private floors = new Map<Id, BuildingFloorOptionsInternal>();
    private undergroundFloors = new Set<Id>();
    private state: RealtySceneState = {
        activeModelId: undefined,
        buildingVisibility: new Map(),
    };

    private groundCoveringSource: GeoJsonSource;
    private control: GltfFloorControl;
    private popup?: HtmlMarker;

    // private poiGroups: PoiGroups;

    constructor(
        private plugin: GltfPlugin,
        private map: MapGL,
        private options: Required<PluginOptions>,
    ) {
        const { position } = this.options.floorsControl;
        this.control = new GltfFloorControl(this.map, { position });
        // this.poiGroups = new PoiGroups(this.map, this.options.poiConfig);
        this.groundCoveringSource = new mapgl.GeoJsonSource(map, {
            maxZoom: 2,
            data: GROUND_COVERING_SOURCE_DATA,
            attributes: {
                purpose: GROUND_COVERING_SOURCE_PURPOSE,
            },
        });

        map.on('styleload', () => {
            this.map.addLayer(GROUND_COVERING_LAYER);
            // this.poiGroups.onMapStyleUpdate();
        });
    }

    private getBuildingModelId(id: Id | undefined) {
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
        const prevState = this.state;

        this.buildings.forEach((_, buildingId) => {
            const prevModelOptions = prevState.buildingVisibility.get(buildingId);
            const newModelOptions = newState.buildingVisibility.get(buildingId);
            if (prevModelOptions) {
                this.plugin.hideModel(prevModelOptions.modelId);
            }

            if (newModelOptions) {
                this.plugin.isModelAdded(newModelOptions.modelId)
                    ? this.plugin.showModel(newModelOptions.modelId)
                    : this.plugin.addModel(newModelOptions);
            }
        });

        if (prevState.activeModelId !== newState.activeModelId) {
            if (
                prevState.activeModelId !== undefined &&
                this.undergroundFloors.has(prevState.activeModelId)
            ) {
                this.switchOffGroundCovering();
            }

            if (newState.activeModelId !== undefined) {
                const options =
                    this.buildings.get(newState.activeModelId) ??
                    this.floors.get(newState.activeModelId);
                if (options) {
                    this.setMapOptions(options.mapOptions);
                    // this.addFloorPoi(activeFloor);
                }

                if (this.undergroundFloors.has(newState.activeModelId)) {
                    this.switchOnGroundCovering();
                }
            }
        }

        const prevBuildingModelId = this.getBuildingModelId(prevState.activeModelId);
        const newBuildingModelId = this.getBuildingModelId(newState.activeModelId);

        if (prevBuildingModelId !== newBuildingModelId) {
            if (newBuildingModelId !== undefined && newState.activeModelId !== undefined) {
                const buildingOptions = this.buildings.get(newBuildingModelId);
                if (buildingOptions) {
                    this.control.show({
                        buildingModelId: buildingOptions.modelId,
                        activeModelId: newState.activeModelId,
                        floorLevels: [
                            {
                                modelId: buildingOptions.modelId,
                                originalId: buildingOptions.modelId,
                                buildingModelId: buildingOptions.modelId,
                                icon: 'building',
                                text: '',
                            },
                            ...buildingOptions.floors,
                        ],
                    });
                }
            }
        }

        this.state = newState;
    }

    public async init(scene: BuildingOptions[], activeModelId?: string) {
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
                    originalId: floor.id,
                    buildingModelId: building.modelId,
                    text: floor.text,
                    icon: floor.icon,
                });

                // Подменяем id активного этажа на внутренний формат buildingId_floorId
                if (activeModelId === floor.id) {
                    activeModelId = floorModelId;
                }

                this.floors.set(floorModelId, {
                    ...floor,
                    buildingOptions: buildingOptions,
                });

                if (floor.isUnderground) {
                    this.undergroundFloors.add(floorModelId);
                }
            });

            this.buildings.set(building.modelId, internalBuilding);
        });

        // Оставляем только существующее значение из переданных modelId
        activeModelId =
            activeModelId !== undefined &&
            (this.buildings.has(activeModelId) || this.floors.has(activeModelId))
                ? activeModelId
                : undefined;

        const modelsToLoad: Map<Id, ModelOptions> = new Map();
        const buildingVisibility: Map<Id, ModelOptions> = new Map();

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
            .addModels(Array.from(modelsToLoad.values()), Array.from(buildingVisibility.keys()))
            .then(() => {
                this.setState({
                    activeModelId,
                    buildingVisibility,
                });

                this.plugin.on('click', this.onSceneClick);
                this.plugin.on('mouseover', this.onSceneMouseOver);
                this.plugin.on('mouseout', this.onSceneMouseOut);
                // this.control.on('floorchange', this.floorChangeHandler);
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

    // public isUndergroundFloorShown() {
    //     return (
    //         this.state.activeModelId !== undefined &&
    //         this.undergroundFloors.has(this.state.activeModelId)
    //     );
    // }

    public destroy() {
        this.plugin.off('click', this.onSceneClick);
        this.plugin.off('mouseover', this.onSceneMouseOver);
        this.plugin.off('mouseout', this.onSceneMouseOut);
        // this.control.off('floorChange', this.floorChangeHandler);

        this.plugin.removeModels([...this.buildings.keys(), ...this.floors.keys()]);

        // this.clearPoiGroups();

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

    private onSceneMouseOut = (ev: GltfPluginPoiEvent | GltfPluginModelEvent) => {
        if (ev.target.type === 'poi') {
            return;
        }

        this.popup?.destroy();
    };

    private onSceneMouseOver = ({ target }: GltfPluginPoiEvent | GltfPluginModelEvent) => {
        if (target.type === 'poi' || target.modelId === undefined) {
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

    private onSceneClick = ({ target }: GltfPluginPoiEvent | GltfPluginModelEvent) => {
        if (target.type === 'model') {
            const options = this.buildings.get(target.modelId);
            if (options) {
                this.buildingClickHandler(target.modelId);
            }
        } else if (target.type === 'poi') {
            const userData = target.data.userData;
            if (isObject(userData) && typeof userData.url === 'string') {
                const a = document.createElement('a');
                a.setAttribute('href', userData.url);
                a.setAttribute('target', '_blank');
                a.click();
            }
        }
    };

    // private floorChangeHandler = (ev: FloorChangeEvent) => {
    //     const model = this.activeBuilding;
    //     if (model !== undefined && model.floors !== undefined) {
    //         if (this.popup !== null) {
    //             this.popup.destroy();
    //         }

    //         // click to the building button
    //         if (ev.floorId === undefined) {
    //             if (this.prevHoveredModelId !== null) {
    //                 this.toggleHighlightModel(this.prevHoveredModelId);
    //             }

    //             this.clearPoiGroups();
    //             const modelsToAdd: ModelOptions[] = this.isUndergroundFloorShown()
    //                 ? (this.scene ?? []).map((scenePart) => getBuildingModelOptions(scenePart))
    //                 : [getBuildingModelOptions(model)];

    //             this.plugin.addModels(modelsToAdd).then(() => {
    //                 if (this.activeModelId !== undefined) {
    //                     this.plugin.removeModel(this.activeModelId, true);
    //                     if (this.isUndergroundFloorShown()) {
    //                         this.switchOffGroundCovering();
    //                     }
    //                 }
    //                 this.setMapOptions(model?.mapOptions);
    //                 this.activeModelId = model.modelId;
    //             });
    //         }
    //         // click to the floor button
    //         if (ev.floorId !== undefined) {
    //             const selectedFloor = model.floors.find((floor) => floor.id === ev.floorId);
    //             if (selectedFloor !== undefined && this.activeModelId !== undefined) {
    //                 const selectedFloorModelOption = getFloorModelOptions(selectedFloor, model);

    //                 // In case of underground -> underground and ground -> ground transitions just switch floor's plan
    //                 if (this.isUndergroundFloorShown() === Boolean(selectedFloor.isUnderground)) {
    //                     this.plugin.addModel(selectedFloorModelOption).then(() => {
    //                         if (this.activeModelId !== undefined) {
    //                             this.plugin.removeModel(this.activeModelId, true);
    //                         }
    //                         this.addFloorPoi(selectedFloor);
    //                     });

    //                     return;
    //                 }

    //                 const modelsToAdd: ModelOptions[] = this.isUndergroundFloorShown()
    //                     ? (this.scene ?? [])
    //                           .filter((scenePart) => scenePart.modelId !== model.modelId)
    //                           .map((scenePart) => getBuildingModelOptions(scenePart))
    //                     : [];

    //                 modelsToAdd.push(selectedFloorModelOption);

    //                 const modelsToRemove = this.isUndergroundFloorShown()
    //                     ? []
    //                     : (this.scene ?? [])
    //                           .filter((scenePart) => scenePart.modelId !== model.modelId)
    //                           .map((scenePart) => scenePart.modelId);

    //                 modelsToRemove.push(this.activeModelId);

    //                 this.plugin.addModels(modelsToAdd).then(() => {
    //                     this.plugin.removeModels(modelsToRemove, true);
    //                     this.isUndergroundFloorShown()
    //                         ? this.switchOffGroundCovering()
    //                         : this.switchOnGroundCovering();
    //                     this.addFloorPoi(selectedFloor);
    //                 });
    //             }
    //         }
    //     }
    // };

    private buildingClickHandler = (modelId: Id) => {
        const buildingOptions = this.buildings.get(modelId);
        if (!buildingOptions) {
            return;
        }

        let activeModelId = modelId;
        const buildingVisibility: Map<Id, ModelOptions> = new Map();
        this.buildings.forEach((options, id) => {
            buildingVisibility.set(id, getBuildingModelOptions(options));
        });

        // показываем самый высокий этаж здания после клика
        const floors = buildingOptions.floors ?? [];
        if (floors.length) {
            const { modelId: floorModelId, buildingModelId } = floors[floors.length - 1];
            const floorOptions = this.floors.get(floorModelId);
            if (floorOptions) {
                activeModelId = floorModelId;
                if (this.undergroundFloors.has(floorModelId)) {
                    buildingVisibility.clear();
                }
                buildingVisibility.set(buildingModelId, getFloorModelOptions(floorOptions));
            }
        }

        this.setState({
            buildingVisibility,
            activeModelId,
        });
    };

    // private addFloorPoi(floorOptions?: BuildingFloorOptions) {
    //     if (floorOptions === undefined) {
    //         return;
    //     }

    //     this.activeModelId = floorOptions.id;

    //     this.setMapOptions(floorOptions?.mapOptions);

    //     this.clearPoiGroups();

    //     floorOptions.poiGroups?.forEach((poiGroup) => {
    //         if (this.activeBuilding?.modelId) {
    //             this.plugin.addPoiGroup(poiGroup, {
    //                 modelId: this.activeBuilding?.modelId,
    //                 floorId: floorOptions.id,
    //             });
    //             this.activePoiGroupIds.push(poiGroup.id);
    //         }
    //     });
    // }

    // private clearPoiGroups() {
    //     this.activePoiGroupIds.forEach((id) => {
    //         this.plugin.removePoiGroup(id);
    //     });

    //     this.activePoiGroupIds = [];
    // }

    // /**
    //  * Add the group of poi to the map
    //  *
    //  * @param options Options of the group of poi to add to the map
    //  * @param state State of the active building to connect with added the group of poi
    //  */
    // public async addPoiGroup(options: PoiGroupOptions, state?: BuildingState) {
    //     this.poiGroups.add(options, state);
    // }

    // /**
    //  * Remove the group of poi from the map
    //  *
    //  * @param id Identifier of the group of poi to remove
    //  */
    // public removePoiGroup(id: Id) {
    //     this.poiGroups.remove(id);
    // }

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

function getBuildingModelOptions(building: BuildingOptionsInternal): ModelOptions {
    return {
        modelId: building.modelId,
        coordinates: building.coordinates,
        modelUrl: building.modelUrl,
        rotateX: building.rotateX,
        rotateY: building.rotateY,
        rotateZ: building.rotateZ,
        offsetX: building.offsetX,
        offsetY: building.offsetY,
        offsetZ: building.offsetZ,
        scale: building.scale,
        linkedIds: building.linkedIds,
        interactive: building.interactive,
    };
}

function getFloorModelOptions({
    buildingOptions,
    id,
    modelUrl,
}: BuildingFloorOptionsInternal): ModelOptions {
    return {
        modelId: getFloorModelId(buildingOptions.modelId, id),
        coordinates: buildingOptions.coordinates,
        modelUrl,
        rotateX: buildingOptions.rotateX,
        rotateY: buildingOptions.rotateY,
        rotateZ: buildingOptions.rotateZ,
        offsetX: buildingOptions.offsetX,
        offsetY: buildingOptions.offsetY,
        offsetZ: buildingOptions.offsetZ,
        scale: buildingOptions.scale,
        linkedIds: buildingOptions.linkedIds,
        interactive: buildingOptions.interactive,
    };
}

function getFloorModelId(buildingModelId: string, floorId: string) {
    return `${buildingModelId}_${floorId}`;
}

const getPopupHtml = ({ description, title }: PopupOptions) =>
    `<div class="${classes.popup}">
        <h2>${title}</h2>
        ${description ? `<p>${description}</p>` : ''}
    </div>`;

function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
