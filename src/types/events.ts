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
}

/**
 * The event type for pointer-related plugin events
 */
export interface GltfPluginPointerEvent {
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

    /**
     * Target of the event (poi or model)
     */
    target: PoiTarget | ModelTarget;
}

/**
 * The list of events that can be emitted by the glTF plugin instance
 */
export interface GltfPluginEventTable {
    /**
     * Emitted when model or poi are clicked
     */
    click: GltfPluginPointerEvent;
    /**
     * Emitted when the user moves the pointer over the model or the poi
     */
    mousemove: GltfPluginPointerEvent;
    /**
     * Emitted when the user hovers over the model or the poi
     */
    mouseover: GltfPluginPointerEvent;
    /**
     * Emitted when the user moves the mouse away from the model or the poi
     */
    mouseout: GltfPluginPointerEvent;
}
