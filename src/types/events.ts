import type { ModelOptions, LabelOptions } from './plugin';

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
    modelId: string;
}

export interface LabelTarget {
    /**
     * Type of the target
     */
    type: 'label';

    /**
     * The targeted poi
     */
    data: LabelOptions;

    /**
     * Identifier of the building's model
     */
    buildingId?: string;

    /**
     * Identifier of the current floor
     */
    floorId?: string;
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
export interface GltfPluginLabelEvent extends GltfPluginPointerEvent {
    /**
     * Target of the poi event
     */
    target: LabelTarget;
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
    click: GltfPluginLabelEvent | GltfPluginModelEvent;
    /**
     * Emitted when the user moves the pointer over the model or the poi
     */
    mousemove: GltfPluginLabelEvent | GltfPluginModelEvent;
    /**
     * Emitted when the user hovers over the model or the poi
     */
    mouseover: GltfPluginLabelEvent | GltfPluginModelEvent;
    /**
     * Emitted when the user moves the mouse away from the model or the poi
     */
    mouseout: GltfPluginLabelEvent | GltfPluginModelEvent;
}
