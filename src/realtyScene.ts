import type { Map as MapGL, AnimationOptions } from '@2gis/mapgl/types';

import { EventSource } from './eventSource';
import { GltfPlugin } from './plugin';
import type {
    BuildingState,
    ModelSceneOptions,
    ModelMapOptions,
    ModelOptions,
    ModelFloorsOptions,
} from './types/plugin';
import { defaultOptions } from './defaultOptions';
import type { ControlShowOptions, FloorLevel, FloorChangeEvent } from './control/types';
import { GltfFloorControl } from './control';
import { clone, createCompoundId } from './utils/common';
import type { PoiGeoJsonProperties } from './types/events';

export class RealtyScene {
    private activeBuilding?: ModelSceneOptions;
    private activeModelId?: number | string;
    private control?: GltfFloorControl;
    private activePoiGroupIds: Array<number | string> = [];
    private container: HTMLElement;
    private buildingFacadeIds: Array<number | string> = [];

    constructor(
        private plugin: GltfPlugin,
        private map: MapGL,
        private eventSource: EventSource,
        private options: typeof defaultOptions,
    ) {
        this.container = map.getContainer();
    }

    public async addRealtyScene(scene: ModelSceneOptions[], state?: BuildingState) {
        // make unique compound identifiers for floor's plans
        this.makeUniqueFloorIds(scene);
        if (state?.floorId !== undefined) {
            state.floorId = createCompoundId(state.modelId, state.floorId);
        }

        // set initial fields
        if (state) {
            this.activeBuilding = scene.find((model) => model.modelId === state.modelId);
            if (this.activeBuilding === undefined) {
                throw new Error(
                    `There is no building's model with id ${state.modelId}. ` +
                        `Please check options of method addRealtyScene`,
                );
            }
            this.activeModelId =
                state.floorId !== undefined ? state.floorId : this.activeBuilding.modelId;
        }

        // initialize initial scene
        const models: ModelOptions[] = [];
        const modelIds: Array<string | number> = [];
        scene.forEach((scenePart) => {
            this.buildingFacadeIds.push(scenePart.modelId);

            const modelOptions = {
                modelId: scenePart.modelId,
                coordinates: scenePart.coordinates,
                modelUrl: scenePart.modelUrl,
                rotateX: scenePart.rotateX,
                rotateY: scenePart.rotateY,
                rotateZ: scenePart.rotateZ,
                offsetX: scenePart.offsetX,
                offsetY: scenePart.offsetY,
                offsetZ: scenePart.offsetZ,
                scale: scenePart.scale,
                linkedIds: scenePart.linkedIds,
                interactive: scenePart.interactive,
            };

            const floors = scenePart.floors ?? [];
            let hasFloorByDefault = false;
            if (state?.floorId !== undefined) {
                for (let floor of floors) {
                    if (floor.id === state.floorId) {
                        // for convenience push original building
                        models.push(modelOptions);
                        // push modified options for floor
                        const clonedOptions = clone(modelOptions);
                        clonedOptions.modelId = floor.id;
                        clonedOptions.modelUrl = floor.modelUrl;
                        models.push(clonedOptions);
                        modelIds.push(floor.id);
                        hasFloorByDefault = true;
                        break;
                    }
                }
            }
            if (!hasFloorByDefault) {
                models.push(modelOptions);
                modelIds.push(scenePart.modelId);
            }

            if (this.options.modelsLoadStrategy === 'waitAll') {
                for (let floor of floors) {
                    if (floor.id === state?.floorId) {
                        continue;
                    }
                    models.push({
                        modelId: floor.id,
                        coordinates: scenePart.coordinates,
                        modelUrl: floor.modelUrl,
                        rotateX: scenePart.rotateX,
                        rotateY: scenePart.rotateY,
                        rotateZ: scenePart.rotateZ,
                        offsetX: scenePart.offsetX,
                        offsetY: scenePart.offsetY,
                        offsetZ: scenePart.offsetZ,
                        scale: scenePart.scale,
                        linkedIds: scenePart.linkedIds,
                        interactive: scenePart.interactive,
                    });
                }
            }
        });

        this.plugin.addModelsPartially(models, modelIds).then(() => {
            // set options after adding models
            if (state?.floorId !== undefined) {
                const floors = this.activeBuilding?.floors ?? [];
                const activeFloor = floors.find((floor) => floor.id === state.floorId);
                this.setMapOptions(activeFloor?.mapOptions);
                this.addFloorPoi(activeFloor);
            } else {
                this.setMapOptions(this.activeBuilding?.mapOptions);
            }

            // initialize control
            const { position } = this.options.floorsControl;
            this.control = new GltfFloorControl(this.map, { position });
            if (state !== undefined) {
                const controlOptions = this.createControlOptions(scene, state);
                this.control?.show(controlOptions);
                if (state.floorId) {
                    this.eventSource?.setCurrentFloorId(state.floorId);
                }
            }

            // bind all events
            this.bindRealtySceneEvents(scene);
        });
    }

    private bindRealtySceneEvents(scene: ModelSceneOptions[]) {
        if (this.control === undefined) {
            return;
        }

        this.control.on('floorChange', (ev) => {
            this.floorChangeHandler(ev);
        });

        this.plugin.on('click', (ev) => {
            if (ev.target.type === 'model') {
                const id = ev.target.modelId;
                if (this.isFacadeBuilding(id) && id !== undefined) {
                    this.buildingClickHandler(scene, id);
                }
            }

            if (ev.target.type === 'poi') {
                this.poiClickHandler(ev.target.data);
            }
        });

        this.plugin.on('mouseover', (ev) => {
            if (ev.target.type === 'model') {
                if (this.isFacadeBuilding(ev.target.modelId)) {
                    this.container.style.cursor = 'pointer';
                }
            }
        });

        this.plugin.on('mouseout', (ev) => {
            if (ev.target.type === 'model') {
                if (this.isFacadeBuilding(ev.target.modelId)) {
                    this.container.style.cursor = '';
                }
            }
        });
    }

    private createControlOptions(scene: ModelSceneOptions[], buildingState: BuildingState) {
        const { modelId, floorId } = buildingState;
        const options: ControlShowOptions = {
            modelId: modelId,
        };
        if (floorId !== undefined) {
            options.floorId = floorId;
        }

        const buildingData = scene.find((scenePart) => scenePart.modelId === modelId);
        if (!buildingData) {
            return options;
        }

        if (buildingData.floors !== undefined) {
            const floorLevels: FloorLevel[] = [
                {
                    icon: 'building',
                    text: '',
                },
            ];
            buildingData.floors.forEach((floor) => {
                floorLevels.push({
                    floorId: floor.id,
                    text: floor.text,
                });
            });
            options.floorLevels = floorLevels;
        }
        return options;
    }

    private setMapOptions(options?: ModelMapOptions) {
        if (options === undefined) {
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

    // checks if the modelId is external facade of the building
    private isFacadeBuilding(modelId?: number | string) {
        if (modelId === undefined) {
            return false;
        }

        return this.buildingFacadeIds.includes(modelId);
    }

    private poiClickHandler(data: PoiGeoJsonProperties) {
        const url: string | undefined = data.userData.url;
        if (url !== undefined) {
            const a = document.createElement('a');
            a.setAttribute('href', url);
            a.setAttribute('target', '_blank');
            a.click();
        }
    }

    private floorChangeHandler(ev: FloorChangeEvent) {
        const model = this.activeBuilding;
        if (model !== undefined && model.floors !== undefined) {
            // click to the building button
            if (ev.floorId === undefined) {
                this.clearPoiGroups();
                this.plugin
                    .addModel({
                        modelId: model.modelId,
                        coordinates: model.coordinates,
                        modelUrl: model.modelUrl,
                        rotateX: model.rotateX,
                        rotateY: model.rotateY,
                        scale: model.scale,
                    })
                    .then(() => {
                        if (this.activeModelId) {
                            this.plugin.removeModel(this.activeModelId, true);
                        }
                        this.setMapOptions(model?.mapOptions);
                        this.activeModelId = model.modelId;
                    });
            }
            // click to the floor button
            if (ev.floorId !== undefined) {
                const selectedFloor = model.floors.find((floor) => floor.id === ev.floorId);
                if (selectedFloor !== undefined && this.activeModelId !== undefined) {
                    this.plugin
                        .addModel({
                            modelId: selectedFloor.id,
                            coordinates: model.coordinates,
                            modelUrl: selectedFloor.modelUrl,
                            rotateX: model.rotateX,
                            rotateY: model.rotateY,
                            scale: model.scale,
                        })
                        .then(() => {
                            if (this.activeModelId) {
                                this.plugin.removeModel(this.activeModelId, true);
                            }

                            this.addFloorPoi(selectedFloor);
                        });
                }
            }
        }
    }

    private buildingClickHandler(scene: ModelSceneOptions[], modelId: string | number) {
        const selectedBuilding = scene.find((model) => model.modelId === modelId);
        if (selectedBuilding === undefined) {
            return;
        }

        this.container.style.cursor = '';

        // if there is a visible floor plan, then show the external
        // facade of the building before focusing on the new building
        if (
            this.activeBuilding &&
            this.activeModelId &&
            this.activeModelId !== this.activeBuilding?.modelId
        ) {
            const oldId = this.activeModelId;
            this.plugin
                .addModel({
                    modelId: this.activeBuilding.modelId,
                    coordinates: this.activeBuilding.coordinates,
                    modelUrl: this.activeBuilding.modelUrl,
                    rotateX: this.activeBuilding.rotateX,
                    rotateY: this.activeBuilding.rotateY,
                    scale: this.activeBuilding.scale,
                })
                .then(() => {
                    this.clearPoiGroups();
                    this.plugin.removeModel(oldId, true);
                });
        }

        // show the highest floor after a click on the building
        const floors = selectedBuilding.floors ?? [];
        if (floors.length !== 0) {
            const floorOptions = floors[floors.length - 1];
            this.plugin
                .addModel({
                    modelId: floorOptions.id,
                    coordinates: selectedBuilding.coordinates,
                    modelUrl: floorOptions.modelUrl,
                    rotateX: selectedBuilding.rotateX,
                    rotateY: selectedBuilding.rotateY,
                    scale: selectedBuilding.scale,
                })
                .then(() => {
                    this.plugin.removeModel(selectedBuilding.modelId, true);
                    this.addFloorPoi(floorOptions);
                    this.control?.switchCurrentFloorLevel(
                        selectedBuilding.modelId,
                        floorOptions.id,
                    );
                });
        } else {
            this.activeModelId = selectedBuilding.modelId;
            this.setMapOptions(selectedBuilding.mapOptions);
        }

        if (
            this.activeBuilding === undefined ||
            selectedBuilding.modelId !== this.activeBuilding?.modelId
        ) {
            // initialize control
            const { position } = this.options.floorsControl;
            this.control?.destroy();
            this.control = new GltfFloorControl(this.map, { position });
            const state = { modelId: selectedBuilding.modelId };
            const controlOptions = this.createControlOptions(scene, state);
            this.control?.show(controlOptions);
            this.control.on('floorChange', (ev) => {
                this.floorChangeHandler(ev);
            });
        }

        this.activeBuilding = selectedBuilding;
    }

    private addFloorPoi(floorOptions?: ModelFloorsOptions) {
        if (floorOptions === undefined) {
            return;
        }

        this.activeModelId = floorOptions.id;

        this.setMapOptions(floorOptions?.mapOptions);

        this.clearPoiGroups();

        floorOptions.poiGroups?.forEach((poiGroup) => {
            if (this.activeBuilding?.modelId) {
                this.plugin.addPoiGroup(poiGroup, {
                    modelId: this.activeBuilding?.modelId,
                    floorId: floorOptions.id,
                });
                this.activePoiGroupIds.push(poiGroup.id);
            }
        });
    }

    private clearPoiGroups() {
        this.activePoiGroupIds.forEach((id) => {
            this.plugin.removePoiGroup({ id });
        });

        this.activePoiGroupIds = [];
    }

    private makeUniqueFloorIds(scene: ModelSceneOptions[]) {
        for (let scenePart of scene) {
            const floors = scenePart.floors ?? [];
            for (let floor of floors) {
                floor.id = createCompoundId(scenePart.modelId, floor.id);
            }
        }
    }
}
