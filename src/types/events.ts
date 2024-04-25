import type { ModelOptions, LabelOptions } from './plugin';

export interface ModelTarget {
    /**
     * The type of a target.
     */
    type: 'model';

    /**
     * A targeted model.
     */
    data: ModelOptions;

    /**
     * An identifier of the building's or floor's model.
     */
    modelId: string;
}

export interface LabelTarget {
    /**
     * The type of a target.
     */
    type: 'label';

    /**
     * A targeted label.
     */
    data: LabelOptions;

    /**
     * An identifier of the building's model.
     */
    buildingId?: string;

    /**
     * An identifier of the current floor.
     */
    floorId?: string;
}

/**
 * Event type for pointer-related plugin events.
 */
interface GltfPluginPointerEvent {
    /**
     * An original DOM event.
     */
    originalEvent: MouseEvent | TouchEvent;

    /**
     * Geographical coordinates of an event.
     */
    lngLat: number[];

    /**
     * Screen coordinates of an event.
     */
    point: number[];
}

/**
 * Event type for pointer-related plugin events emitted by a label.
 */
export interface GltfPluginLabelEvent extends GltfPluginPointerEvent {
    /**
     * A target of a label event.
     */
    target: LabelTarget;
}

/**
 * Event type for pointer-related plugin events emitted by a model.
 */
export interface GltfPluginModelEvent extends GltfPluginPointerEvent {
    /**
     * A target of a model event.
     */
    target: ModelTarget;
}

/**
 * List of events that can be emitted by the GLTF plugin instance.
 */
export interface GltfPluginEventTable {
    /**
     * Emitted when a model or a label is clicked.
     */
    click: GltfPluginLabelEvent | GltfPluginModelEvent;
    /**
     * Emitted when user moves pointer over a model or a label.
     */
    mousemove: GltfPluginLabelEvent | GltfPluginModelEvent;
    /**
     * Emitted when user hovers over a model or a label.
     */
    mouseover: GltfPluginLabelEvent | GltfPluginModelEvent;
    /**
     * Emitted when user moves mouse away from a model or a label.
     */
    mouseout: GltfPluginLabelEvent | GltfPluginModelEvent;
}
