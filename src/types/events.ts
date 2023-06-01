import type { ModelOptions } from '../types/plugin';

export type PoiOptions = Record<string, any>;

interface ModelTarget {
    /**
     * Type of the target
     */
    type: 'model';

    /**
     * The targeted model
     */
    data: ModelOptions;

    /**
     * User specific data
     */
    userData?: any;

    /**
     * Identifier of the building's model
     */
    buildingId?: number | string;

    /**
     * Identifier of the floor's model
     */
    floorId?: number | string;
}

interface PoiTarget {
    /**
     * Type of the target
     */
    type: 'poi';

    /**
     * The targeted poi
     */
    data: PoiOptions;

    /**
     * User specific data
     */
    userData?: any;

    /**
     * Identifier of the building's model
     */
    buildingId?: number | string;

    /**
     * Identifier of the floor's model
     */
    floorId?: number | string;
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
