import type { Map as MapGL, AnimationOptions } from '@2gis/mapgl/types';

import { EventSource } from './eventSource';
import { GltfPlugin } from './plugin';
import type { BuildingState, ModelSceneOptions, ModelMapOptions } from './types/plugin';
import { defaultOptions } from './defaultOptions';
import { ControlShowOptions, FloorLevel, FloorChangeEvent } from './control/types';
import { GltfFloorControl } from './control';

export class RealtyScene {
    private activeBuilding?: ModelSceneOptions;
    private activeModelId?: number | string;
    private control?: GltfFloorControl;
    private activePoiGroupIds: Array<number | string> = [];

    constructor(
        private plugin: GltfPlugin,
        private map: MapGL,
        private eventSource: EventSource,
        private options: typeof defaultOptions,
    ) {}

    private createControlOptions(scene: ModelSceneOptions[], buildingState: BuildingState) {
        const { modelId, floorId } = buildingState;
        const buildingData = scene.find((scenePart) => scenePart.modelId === modelId);
        if (!buildingData) {
            throw new Error(
                `There is no building's model with id ${modelId}. Please check options of method addRealtyScene`,
            );
        }

        const options: ControlShowOptions = {
            modelId: modelId,
        };
        if (floorId) {
            options.floorId = floorId;
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

    public async addRealtyScene(scene: ModelSceneOptions[], state?: BuildingState) {
        // set activeBuilding
        if (state) {
            this.activeBuilding = scene.find((model) => model.modelId === state.modelId);
            this.activeModelId = this.activeBuilding?.modelId;
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

        // initialize initial scene
        const mainModels = scene.map(
            ({ modelId, coordinates, modelUrl, rotateX, rotateY, scale, linkedIds }) => ({
                modelId,
                coordinates,
                modelUrl,
                rotateX,
                rotateY,
                scale,
                linkedIds,
            }),
        );
        this.plugin.addModels(mainModels);

        // bind events
        this.plugin.on('click', (ev) => {
            if (ev.target.type === 'model') {
                // set activeBuilding
                const selectedBuilding = scene.find((model) => model.modelId === ev.target.modelId);
                if (!selectedBuilding) {
                    return;
                }
                if (selectedBuilding.modelId !== this.activeBuilding?.modelId) {
                    // if there is a visible floor plan, then show the whole building
                    // before focusing on the different building
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
                                this.plugin.removeModel(oldId);
                            });
                    }
                    this.activeBuilding = selectedBuilding;
                    this.activeModelId = selectedBuilding.modelId;
                    this.setMapOptions(this.activeBuilding?.mapOptions);

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
            }
        });
        this.control.on('floorChange', (ev) => {
            this.floorChangeHandler(ev);
        });
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
                            this.plugin.removeModel(this.activeModelId);
                        }
                        this.activeModelId = model.modelId;
                    });
            }
            // click to the floor button
            if (ev.floorId !== undefined) {
                const selectedFloor = model.floors.find((floor) => floor.id === ev.floorId);
                const oldId = this.activeModelId;
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
                                this.plugin.removeModel(this.activeModelId);
                            }
                            this.activeModelId = selectedFloor.id;

                            this.clearPoiGroups();

                            selectedFloor.poiGroups?.forEach((poiGroup) => {
                                if (oldId) {
                                    this.plugin.addPoiGroup(poiGroup, {
                                        modelId: oldId,
                                        floorId: selectedFloor.id,
                                    });
                                    this.activePoiGroupIds.push(poiGroup.id);
                                }
                            });
                        });
                }
            }
        }
    }

    private clearPoiGroups() {
        this.activePoiGroupIds.forEach((id) => {
            this.plugin.removePoiGroup({ id });
        });

        this.activePoiGroupIds = [];
    }
}
