import type { ModelOptions, PoiOptions } from '../types/plugin';

export type PoiGeoJsonProperties = PoiOptions & {
    /**
     * Identifier of the building's model
     */
    modelId?: number | string;

    /**
     * Identifier of the floor's model
     */
    floorId?: number | string;

    /**
     * Type of the poi
     */
    type?: string;
};

export interface ModelTarget {
    /**
     * Type of the target
     */
    type: 'model';

    /**
     * The targeted model
     */
    data: ModelOptions;

    /**
     * Identifier of the building's model
     */
    modelId?: number | string;

    /**
     * Identifier of the current floor
     */
    floorId?: number | string;
}

export interface PoiTarget {
    /**
     * Type of the target
     */
    type: 'poi';

    /**
     * The targeted poi
     */
    data: PoiGeoJsonProperties;

    /**
     * Identifier of the building's model
     */
    modelId?: number | string;

    /**
     * Identifier of the current floor
     */
    floorId?: number | string;
}

/**
 * Contains a floor level data.
 */
export interface ModelFloorLevel {
    /**
     * A floor level index
     */
    floorLevelKey: number | 'building';
    /**
     * A floor level name
     */
    floorLevelName: string;
    /**
     * A floor level type
     */
    floorLevelIcon?: 'parking' | 'building' | string;
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
    floorLevelIcon?: 'parking';
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
 * The event type for pointer-related plugin events
 */
interface GltfPluginPointerEvent {
    /**
     * The original DOM event
     */
    originalEvent: MouseEvent | TouchEvent;

    /**
     * Geographical coordinates of the event
     */
    lngLat: number[];

    /**
     * Screen coordinates of the event
     */
    point: number[];
}

/**
 * The event type for pointer-related plugin events emitted by the poi
 */
export interface GltfPluginPoiEvent extends GltfPluginPointerEvent {
    /**
     * Target of the poi event
     */
    target: PoiTarget;
}

/**
 * The event type for pointer-related plugin events emitted by the model
 */
export interface GltfPluginModelEvent extends GltfPluginPointerEvent {
    /**
     * Target of the model event
     */
    target: ModelTarget;
}

/**
 * The list of events that can be emitted by the glTF plugin instance
 */
export interface GltfPluginEventTable {
    /**
     * Emitted when model or poi are clicked
     */
    click: GltfPluginPoiEvent | GltfPluginModelEvent;
    /**
     * Emitted when the user moves the pointer over the model or the poi
     */
    mousemove: GltfPluginPoiEvent | GltfPluginModelEvent;
    /**
     * Emitted when the user hovers over the model or the poi
     */
    mouseover: GltfPluginPoiEvent | GltfPluginModelEvent;
    /**
     * Emitted when the user moves the mouse away from the model or the poi
     */
    mouseout: GltfPluginPoiEvent | GltfPluginModelEvent;
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
