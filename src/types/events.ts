import type { Id, ModelOptions, PoiOptions } from './plugin';

export type PoiGeoJsonProperties = PoiOptions & {
    /**
     * Identifier of the building's model
     */
    modelId?: Id;

    /**
     * Identifier of the floor's model
     */
    floorId?: Id;

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
     * Identifier of the building's or floor's model
     */
    modelId: Id;
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
    modelId?: Id;

    /**
     * Identifier of the current floor
     */
    floorId?: Id;
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
}
