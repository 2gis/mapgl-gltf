// import type { Map as MapGL, AnimationOptions, HtmlMarker, GeoJsonSource } from '@2gis/mapgl/types';

// import { GltfPlugin } from '../plugin';
// import { defaultOptions } from '../defaultOptions';
// import { GltfFloorControl } from '../control';
// import { clone, createCompoundId } from '../utils/common';
// import classes from './realtyScene.module.css';

// import type { Id, BuildingState, ModelOptions } from '../types/plugin';
// import type {
//     BuildingOptions,
//     MapOptions,
//     BuildingFloorOptions,
//     PopupOptions,
// } from '../types/realtyScene';
// import type { ControlShowOptions, FloorLevel, FloorChangeEvent } from '../control/types';
// import type {
//     GltfPluginModelEvent,
//     GltfPluginPoiEvent,
//     PoiGeoJsonProperties,
// } from '../types/events';
// import { GROUND_COVERING_LAYER, GROUND_COVERING_SOURCE_DATA, GROUND_COVERING_SOURCE_PURPOSE } from '../constants';

// export class RealtyScene {
//     private activeBuilding?: BuildingOptions;
//     private activeModelId?: Id;
//     private control?: GltfFloorControl;
//     private activePoiGroupIds: Id[] = [];
//     private container: HTMLElement;
//     private buildingFacadeIds: Id[] = [];
//     // this field is needed when the highlighted
//     // model is placed under the floors' control
//     private prevHoveredModelId: Id | null = null;
//     private popup: HtmlMarker | null = null;
//     private scene: BuildingOptions[] | null = null;
//     private groundCoveringSource: GeoJsonSource;
//     private undergroundFloors = new Set<Id>();
//     private poiGroups: PoiGroups;

//     constructor(
//         private plugin: GltfPlugin,
//         private map: MapGL,
//         private eventSource: EventSource,
//         private models: Map<string, THREE.Object3D>,
//         private options: typeof defaultOptions,
//     ) {
//         this.poiGroups = new PoiGroups(this.map, this.options.poiConfig);
//         this.container = map.getContainer();
//         this.groundCoveringSource = new mapgl.GeoJsonSource(map, {
//             maxZoom: 2,
//             data: GROUND_COVERING_SOURCE_DATA,
//             attributes: {
//                 purpose: GROUND_COVERING_SOURCE_PURPOSE,
//             },
//         });

//         map.on('styleload', () => {
//             this.map.addLayer(GROUND_COVERING_LAYER);
//             this.poiGroups.onMapStyleUpdate();})
//     }

//     public async add(scene: BuildingOptions[], originalState?: BuildingState) {
//         // make unique compound identifiers for floor's plans
//         let state = originalState === undefined ? originalState : clone(originalState);
//         this.makeUniqueFloorIds(scene);
//         if (state?.floorId !== undefined) {
//             state.floorId = createCompoundId(state.modelId, state.floorId);
//         }

//         // set initial fields
//         if (state !== undefined) {
//             this.activeBuilding = scene.find((model) => model.modelId === state?.modelId);
//             if (this.activeBuilding === undefined) {
//                 throw new Error(
//                     `There is no building's model with id ${state.modelId}. ` +
//                         `Please check options of method addRealtyScene`,
//                 );
//             }
//             this.activeModelId =
//                 state.floorId !== undefined ? state.floorId : this.activeBuilding.modelId;
//         }

//         // initialize initial scene
//         const models: ModelOptions[] = [];
//         const modelIds: Id[] = [];
//         this.scene = scene;
//         scene.forEach((scenePart) => {
//             this.buildingFacadeIds.push(scenePart.modelId);
//             const modelOptions = getBuildingModelOptions(scenePart);
//             const floors = scenePart.floors ?? [];
//             let hasFloorByDefault = false;

//             for (let floor of floors) {
//                 if (floor.isUnderground) {
//                     this.undergroundFloors.add(floor.id);
//                 }

//                 if (state?.floorId !== undefined && floor.id === state.floorId) {
//                     // for convenience push original building
//                     models.push(modelOptions);
//                     // push modified options for floor
//                     models.push(getFloorModelOptions(floor, scenePart));
//                     modelIds.push(floor.id);
//                     hasFloorByDefault = true;
//                 }
//             }

//             if (!hasFloorByDefault) {
//                 models.push(modelOptions);
//                 modelIds.push(scenePart.modelId);
//             }

//             if (this.options.modelsLoadStrategy === 'waitAll') {
//                 for (let floor of floors) {
//                     if (floor.id === state?.floorId) {
//                         continue;
//                     }
//                     models.push(getFloorModelOptions(floor, scenePart));
//                 }
//             }
//         });

//         // Leave only the underground floor's plan to be shown
//         if (state?.floorId !== undefined && this.undergroundFloors.has(state.floorId)) {
//             modelIds.length = 0;
//             modelIds.push(state.floorId);
//         }

//         return this.plugin.addModelsPartially(models, modelIds).then(() => {
//             // set options after adding models
//             if (state?.floorId !== undefined) {
//                 const floors = this.activeBuilding?.floors ?? [];
//                 const activeFloor = floors.find((floor) => floor.id === state?.floorId);
//                 this.setMapOptions(activeFloor?.mapOptions);
//                 this.addFloorPoi(activeFloor);
//                 if (this.undergroundFloors.has(state.floorId)) {
//                     this.switchOnGroundCovering();
//                 }
//             } else {
//                 this.setMapOptions(this.activeBuilding?.mapOptions);
//             }

//             // initialize floors' control
//             const { position } = this.options.floorsControl;
//             this.control = new GltfFloorControl(this.map, { position });
//             if (state !== undefined) {
//                 const controlOptions = this.createControlOptions(scene, state);
//                 this.control?.show(controlOptions);
//                 if (state.floorId) {
//                     this.eventSource.setCurrentFloorId(state.floorId);
//                 }
//             }

//             // bind all events
//             this.bindRealtySceneEvents();
//         });
//     }

//     public resetGroundCoveringColor() {
//         const attrs = this.groundCoveringSource.getAttributes();
//         if ('color' in attrs) {
//             this.groundCoveringSource.setAttributes({
//                 ...attrs,
//                 color: this.options.groundCoveringColor,
//             });
//         }
//     }

//     public isUndergroundFloorShown() {
//         return this.activeModelId !== undefined && this.undergroundFloors.has(this.activeModelId);
//     }

//     public destroy(preserveCache?: boolean) {
//         this.unbindRealtySceneEvents();

//         this.plugin.removeModels(
//             this.scene?.reduce<Id[]>((agg, opts) => {
//                 agg.push(opts.modelId);
//                 opts.floors?.forEach((floor) => agg.push(floor.id));

//                 return agg;
//             }, []) ?? [],
//             preserveCache,
//         );

//         this.clearPoiGroups();
//         this.eventSource.setCurrentFloorId(null);

//         this.groundCoveringSource.destroy();
//         this.undergroundFloors.clear();

//         this.control?.destroy();
//         this.control = undefined;

//         this.popup?.destroy();
//         this.popup = null;

//         this.activeBuilding = undefined;
//         this.activeModelId = undefined;
//         this.activePoiGroupIds = [];
//         this.buildingFacadeIds = [];
//         this.prevHoveredModelId = null;
//         this.scene = null;
//     }

//     private bindRealtySceneEvents() {
//         this.plugin.on('click', this.onSceneClick);
//         this.plugin.on('mouseover', this.onSceneMouseOver);
//         this.plugin.on('mouseout', this.onSceneMouseOut);

//         this.control?.on('floorChange', this.floorChangeHandler);
//     }

//     private unbindRealtySceneEvents() {
//         this.plugin.off('click', this.onSceneClick);
//         this.plugin.off('mouseover', this.onSceneMouseOver);
//         this.plugin.off('mouseout', this.onSceneMouseOut);

//         this.control?.off('floorChange', this.floorChangeHandler);
//     }

//     private createControlOptions(scene: BuildingOptions[], buildingState: BuildingState) {
//         const { modelId, floorId } = buildingState;
//         const options: ControlShowOptions = {
//             modelId: modelId,
//         };
//         if (floorId !== undefined) {
//             options.floorId = floorId;
//         }

//         const buildingData = scene.find((scenePart) => scenePart.modelId === modelId);
//         if (!buildingData) {
//             return options;
//         }

//         if (buildingData.floors !== undefined) {
//             const floorLevels: FloorLevel[] = [
//                 {
//                     icon: 'building',
//                     text: '',
//                 },
//             ];
//             buildingData.floors.forEach((floor) => {
//                 floorLevels.push({
//                     floorId: floor.id,
//                     text: floor.text,
//                 });
//             });
//             options.floorLevels = floorLevels;
//         }
//         return options;
//     }

//     private setMapOptions(options?: MapOptions) {
//         if (!options) {
//             return;
//         }

//         const animationOptions: AnimationOptions = {
//             easing: 'easeInSine',
//             duration: 500,
//         };
//         if (options.center) {
//             this.map.setCenter(options.center, animationOptions);
//         }
//         if (options.pitch) {
//             this.map.setPitch(options.pitch, animationOptions);
//         }
//         if (options.rotation) {
//             this.map.setRotation(options.rotation, animationOptions);
//         }
//         if (options.zoom) {
//             this.map.setZoom(options.zoom, animationOptions);
//         }
//     }

//     // checks if the modelId is external facade of the building
//     private isFacadeBuilding(modelId?: Id): modelId is Id {
//         if (modelId === undefined) {
//             return false;
//         }

//         return this.buildingFacadeIds.includes(modelId);
//     }

//     private getPopupOptions(modelId: Id): PopupOptions | undefined {
//         if (this.scene === null) {
//             return;
//         }
//         let building = this.scene.find((building) => building.modelId === modelId);
//         if (building === undefined) {
//             return;
//         }
//         return building.popupOptions;
//     }

//     private onSceneMouseOver = (ev: GltfPluginPoiEvent | GltfPluginModelEvent) => {
//         if (ev.target.type === 'model') {
//             const id = ev.target.modelId;
//             if (this.isFacadeBuilding(id)) {
//                 this.container.style.cursor = 'pointer';
//                 this.toggleHighlightModel(id);
//                 let popupOptions = this.getPopupOptions(id);
//                 if (popupOptions) {
//                     this.showPopup(popupOptions);
//                 }
//             }
//         }
//     };
//     private onSceneMouseOut = (ev: GltfPluginPoiEvent | GltfPluginModelEvent) => {
//         if (ev.target.type === 'model') {
//             const id = ev.target.modelId;
//             if (this.isFacadeBuilding(id)) {
//                 this.container.style.cursor = '';
//                 this.hidePopup();
//                 if (this.prevHoveredModelId !== null) {
//                     this.toggleHighlightModel(id);
//                 }
//             }
//         }
//     };

//     private onSceneClick = (ev: GltfPluginPoiEvent | GltfPluginModelEvent) => {
//         if (this.scene === null) {
//             return;
//         }

//         if (ev.target.type === 'model') {
//             const id = ev.target.modelId;
//             if (this.isFacadeBuilding(id)) {
//                 this.buildingClickHandler(this.scene, id);
//             }
//         }

//         if (ev.target.type === 'poi') {
//             this.poiClickHandler(ev.target.data);
//         }
//     };

//     private poiClickHandler = (data: PoiGeoJsonProperties) => {
//         const url: string | undefined = data.userData.url;
//         if (url !== undefined) {
//             const a = document.createElement('a');
//             a.setAttribute('href', url);
//             a.setAttribute('target', '_blank');
//             a.click();
//         }
//     };

//     private floorChangeHandler = (ev: FloorChangeEvent) => {
//         const model = this.activeBuilding;
//         if (model !== undefined && model.floors !== undefined) {
//             if (this.popup !== null) {
//                 this.popup.destroy();
//             }

//             // click to the building button
//             if (ev.floorId === undefined) {
//                 if (this.prevHoveredModelId !== null) {
//                     this.toggleHighlightModel(this.prevHoveredModelId);
//                 }

//                 this.clearPoiGroups();
//                 const modelsToAdd: ModelOptions[] = this.isUndergroundFloorShown()
//                     ? (this.scene ?? []).map((scenePart) => getBuildingModelOptions(scenePart))
//                     : [getBuildingModelOptions(model)];

//                 this.plugin.addModels(modelsToAdd).then(() => {
//                     if (this.activeModelId !== undefined) {
//                         this.plugin.removeModel(this.activeModelId, true);
//                         if (this.isUndergroundFloorShown()) {
//                             this.switchOffGroundCovering();
//                         }
//                     }
//                     this.setMapOptions(model?.mapOptions);
//                     this.activeModelId = model.modelId;
//                 });
//             }
//             // click to the floor button
//             if (ev.floorId !== undefined) {
//                 const selectedFloor = model.floors.find((floor) => floor.id === ev.floorId);
//                 if (selectedFloor !== undefined && this.activeModelId !== undefined) {
//                     const selectedFloorModelOption = getFloorModelOptions(selectedFloor, model);

//                     // In case of underground -> underground and ground -> ground transitions just switch floor's plan
//                     if (this.isUndergroundFloorShown() === Boolean(selectedFloor.isUnderground)) {
//                         this.plugin.addModel(selectedFloorModelOption).then(() => {
//                             if (this.activeModelId !== undefined) {
//                                 this.plugin.removeModel(this.activeModelId, true);
//                             }
//                             this.addFloorPoi(selectedFloor);
//                         });

//                         return;
//                     }

//                     const modelsToAdd: ModelOptions[] = this.isUndergroundFloorShown()
//                         ? (this.scene ?? [])
//                               .filter((scenePart) => scenePart.modelId !== model.modelId)
//                               .map((scenePart) => getBuildingModelOptions(scenePart))
//                         : [];

//                     modelsToAdd.push(selectedFloorModelOption);

//                     const modelsToRemove = this.isUndergroundFloorShown()
//                         ? []
//                         : (this.scene ?? [])
//                               .filter((scenePart) => scenePart.modelId !== model.modelId)
//                               .map((scenePart) => scenePart.modelId);

//                     modelsToRemove.push(this.activeModelId);

//                     this.plugin.addModels(modelsToAdd).then(() => {
//                         this.plugin.removeModels(modelsToRemove, true);
//                         this.isUndergroundFloorShown()
//                             ? this.switchOffGroundCovering()
//                             : this.switchOnGroundCovering();
//                         this.addFloorPoi(selectedFloor);
//                     });
//                 }
//             }
//         }
//     };

//     private buildingClickHandler = (scene: BuildingOptions[], modelId: Id) => {
//         const selectedBuilding = scene.find((model) => model.modelId === modelId);
//         if (selectedBuilding === undefined) {
//             return;
//         }

//         // don't show the pointer cursor on the model when user
//         // started to interact with the building
//         this.container.style.cursor = '';

//         if (this.popup !== null) {
//             this.popup.destroy();
//         }

//         // if there is a visible floor plan, then show the external
//         // facade of the active building before focusing on the new building
//         if (
//             this.activeBuilding &&
//             this.activeModelId &&
//             this.activeModelId !== this.activeBuilding?.modelId
//         ) {
//             // User is able to click on any other buildings as long as ground floor's plan is shown
//             // because when underground floor's plan is shown other buildings are hidden.
//             const oldId = this.activeModelId;
//             this.plugin.addModel(getBuildingModelOptions(this.activeBuilding)).then(() => {
//                 this.clearPoiGroups();
//                 this.plugin.removeModel(oldId, true);
//             });
//         }

//         // show the highest floor after a click on the building
//         const floors = selectedBuilding.floors ?? [];
//         if (floors.length !== 0) {
//             const floorOptions = floors[floors.length - 1];

//             const modelsToRemove = floorOptions.isUnderground
//                 ? scene.map((scenePart) => scenePart.modelId)
//                 : [selectedBuilding.modelId];

//             this.plugin.addModel(getFloorModelOptions(floorOptions, selectedBuilding)).then(() => {
//                 this.plugin.removeModels(modelsToRemove, true);
//                 if (floorOptions.isUnderground) {
//                     this.switchOnGroundCovering();
//                 }
//                 this.addFloorPoi(floorOptions);
//                 this.control?.switchCurrentFloorLevel(selectedBuilding.modelId, floorOptions.id);
//             });
//         } else {
//             this.activeModelId = selectedBuilding.modelId;
//             this.setMapOptions(selectedBuilding.mapOptions);
//         }

//         if (
//             this.activeBuilding === undefined ||
//             selectedBuilding.modelId !== this.activeBuilding?.modelId
//         ) {
//             // initialize control
//             const { position } = this.options.floorsControl;
//             this.control?.destroy();
//             this.control = new GltfFloorControl(this.map, { position });
//             const state = { modelId: selectedBuilding.modelId };
//             const controlOptions = this.createControlOptions(scene, state);
//             this.control?.show(controlOptions);
//             this.control.on('floorChange', (ev) => {
//                 this.floorChangeHandler(ev);
//             });
//         }

//         this.activeBuilding = selectedBuilding;
//     };

//     private addFloorPoi(floorOptions?: BuildingFloorOptions) {
//         if (floorOptions === undefined) {
//             return;
//         }

//         this.activeModelId = floorOptions.id;

//         this.setMapOptions(floorOptions?.mapOptions);

//         this.clearPoiGroups();

//         floorOptions.poiGroups?.forEach((poiGroup) => {
//             if (this.activeBuilding?.modelId) {
//                 this.plugin.addPoiGroup(poiGroup, {
//                     modelId: this.activeBuilding?.modelId,
//                     floorId: floorOptions.id,
//                 });
//                 this.activePoiGroupIds.push(poiGroup.id);
//             }
//         });
//     }

//     private clearPoiGroups() {
//         this.activePoiGroupIds.forEach((id) => {
//             this.plugin.removePoiGroup(id);
//         });

//         this.activePoiGroupIds = [];
//     }

//     /**
//      * Add the group of poi to the map
//      *
//      * @param options Options of the group of poi to add to the map
//      * @param state State of the active building to connect with added the group of poi
//      */
//     public async addPoiGroup(options: PoiGroupOptions, state?: BuildingState) {
//         this.poiGroups.add(options, state);
//     }

//     /**
//      * Remove the group of poi from the map
//      *
//      * @param id Identifier of the group of poi to remove
//      */
//     public removePoiGroup(id: Id) {
//         this.poiGroups.remove(id);
//     }

//     // TODO: Don't mutate scene data.
//     private makeUniqueFloorIds(scene: BuildingOptions[]) {
//         for (let scenePart of scene) {
//             const floors = scenePart.floors ?? [];
//             for (let floor of floors) {
//                 if (!floor.id.toString().startsWith(scenePart.modelId.toString())) {
//                     floor.id = createCompoundId(scenePart.modelId, floor.id);
//                 }
//             }
//         }
//     }

//     public toggleHighlightModel(modelId: Id) {
//         // skip toggle if user is using default emissiveIntensity
//         // that means that model won't be hovered
//         const { intencity } = this.options.hoverHighlight;
//         if (intencity === 0) {
//             return;
//         }

//         const model = this.models.get(String(modelId));

//         if (model === undefined) {
//             return;
//         }

//         let shouldUnsetFlag = false;
//         model.traverse((obj) => {
//             if (obj instanceof THREE.Mesh) {
//                 if (modelId === this.prevHoveredModelId) {
//                     obj.material.emissiveIntensity = 0.0;
//                     shouldUnsetFlag = true;
//                 } else {
//                     obj.material.emissiveIntensity = intencity;
//                 }
//             }
//         });

//         this.prevHoveredModelId = shouldUnsetFlag ? null : modelId;
//         this.map.triggerRerender();
//     }

//     private showPopup(options: PopupOptions) {
//         this.popup = new mapgl.HtmlMarker(this.map, {
//             coordinates: options.coordinates,
//             html: this.getPopupHtml(options),
//         });
//     }

//     private hidePopup() {
//         if (this.popup !== null) {
//             this.popup.destroy();
//             this.popup = null;
//         }
//     }

//     private getPopupHtml(data: PopupOptions) {
//         if (data.description === undefined) {
//             return `<div class="${classes.popup}">
//                 <h2>${data.title}</h2>
//             </div>`;
//         }

//         return `<div class="${classes.popup}">
//             <h2>${data.title}</h2>
//             <p>${data.description}</p>
//         </div>`;
//     }

//     private switchOffGroundCovering() {
//         const attrs = { ...this.groundCoveringSource.getAttributes() };
//         delete attrs['color'];
//         this.groundCoveringSource.setAttributes(attrs);
//     }

//     private switchOnGroundCovering() {
//         this.groundCoveringSource.setAttributes({
//             ...this.groundCoveringSource.getAttributes(),
//             color: this.options.groundCoveringColor,
//         });
//     }
// }

// function getBuildingModelOptions(building: BuildingOptions): ModelOptions {
//     return {
//         modelId: building.modelId,
//         coordinates: building.coordinates,
//         modelUrl: building.modelUrl,
//         rotateX: building.rotateX,
//         rotateY: building.rotateY,
//         rotateZ: building.rotateZ,
//         offsetX: building.offsetX,
//         offsetY: building.offsetY,
//         offsetZ: building.offsetZ,
//         scale: building.scale,
//         linkedIds: building.linkedIds,
//         interactive: building.interactive,
//     };
// }

// function getFloorModelOptions(
//     floor: BuildingFloorOptions,
//     building: BuildingOptions,
// ): ModelOptions {
//     return {
//         modelId: floor.id,
//         coordinates: building.coordinates,
//         modelUrl: floor.modelUrl,
//         rotateX: building.rotateX,
//         rotateY: building.rotateY,
//         rotateZ: building.rotateZ,
//         offsetX: building.offsetX,
//         offsetY: building.offsetY,
//         offsetZ: building.offsetZ,
//         scale: building.scale,
//         linkedIds: building.linkedIds,
//         interactive: building.interactive,
//     };
// }
