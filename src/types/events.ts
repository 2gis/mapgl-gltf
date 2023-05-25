import type { MapPointerEvent } from '@2gis/mapgl/types';

/**
 * The list of events that can be emitted by the glTF plugin instance
 */
export interface GltfPluginEventTable {
    /**
     * Emitted when model is clicked
     */
    clickModel: MapPointerEvent;
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
}
