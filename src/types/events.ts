import type { MapPointerEvent } from '@2gis/mapgl/types';

/**
 * Contains a floor level data.
 */
export interface ModelFloorLevel {
    /**
     * A floor level index
     */
    floorLevelKey: number | string;
    /**
     * A floor level name
     */
    floorLevelName: string;
    /**
     * A floor level type
     */
    floorLevelType?: 'parking';
}

/**
 * Contains an appeared floor plan data.
 */
export interface ModelFloorPlanShowEvent {
    /**
     * An id of an appeared floor plan.
     */
    floorPlanId: string | number;
    /**
     * An key of a current displayed floor level.
     */
    currentFloorLevelKey: number | string;
    /**
     * All available floor plan levels.
     */
    floorLevels: ModelFloorLevel[];
}

/**
 * Contains a current floor level data.
 */
export interface ModelFloorLevelChangeEvent {
    /**
     * An id of a floor plan.
     */
    floorPlanId: string;
    /**
     * A current level index of a floor plan.
     */
    floorLevelKey: number | string;
    /**
     * A current level name of a floor plan.
     */
    floorLevelName: string;
    /**
     * A floor level type
     */
    floorLevelType?: 'parking';
}

/**
 * Contains a disappeared floor plan data.
 */
export interface ModelFloorPlanHideEvent {
    /**
     * An id of a disappeared floor plan.
     */
    floorPlanId: string;
}

/**
 * The list of events that can be emitted by the glTF plugin instance
 */
export interface GltfPluginEventTable {
    /**
     * Emitted when model is clicked.
     */
    clickModel: MapPointerEvent;
    /**
     * Emitted when the user moves the pointer over the model.
     */
    mousemoveModel: MapPointerEvent;
    /**
     * Emitted when the user hovers over the model.
     */
    mouseoverModel: MapPointerEvent;
    /**
     * Emitted when the user moves the mouse away from the model.
     */
    mouseoutModel: MapPointerEvent;
    /**
     * Emitted when poi is clicked
     */
    clickPoi: MapPointerEvent;
    /**
     * Emitted when the user moves the pointer over the poi.
     */
    mousemovePoi: MapPointerEvent;
    /**
     * Emitted when the user hovers over the poi.
     */
    mouseoverPoi: MapPointerEvent;
    /**
     * Emitted when the user moves the mouse away from the poi.
     */
    mouseoutPoi: MapPointerEvent;
    /**
     * Emitted when model is show.
     */
    showModelFloorPlan: ModelFloorPlanShowEvent;
    /**
     * Emitted when model is hide.
     */
    hideModelFloorPlan: ModelFloorPlanHideEvent;
    /**
     * Emitted when model floor plan is change.
     */
    changeModelFloorPlan: ModelFloorLevelChangeEvent;
}
