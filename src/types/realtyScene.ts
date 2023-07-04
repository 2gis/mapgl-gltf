import type { Id, PoiGroupOptions, ModelOptions } from './plugin';

/**
 * Options for the map
 */
export interface MapOptions {
    /**
     * Geographical center of the map
     */
    center?: number[];
    /**
     * Map's pitch angle in degrees
     */
    pitch?: number;
    /**
     * Map's rotation angle in degrees
     */
    rotation?: number;
    /**
     * Map's zoom
     */
    zoom?: number;
}

/**
 * Options for a floor's plan on the realty scene
 */
export interface BuildingFloorOptions {
    /**
     * Identifier of the floor's plan
     */
    id: Id;
    /**
     * Text to add to the floors' control
     */
    text: string;
    /**
     * Url of a model that represents the current floor's plan
     */
    modelUrl: string;
    /**
     * Icon to add to the floors' control
     */
    icon?: 'building' | 'parking' | string;
    /**
     * List of poi groups connected with the floor's plan
     */
    poiGroups?: PoiGroupOptions[];
    /**
     * Map's options to apply after selecting the particular floor
     */
    mapOptions?: MapOptions;
}

export interface PopupOptions {
    coordinates: number[];
    /**
     * Title of popup that appears on hover
     */
    title: string;
    /**
     * Description of popup that appears on hover
     */
    description?: string;
}

/**
 * Options for a building on the realty scene
 */
export interface BuildingOptions extends ModelOptions {
    /**
     * Map's options to apply after selecting the particular building
     */
    mapOptions?: MapOptions;
    /**
     * List of the floors' plans connected with the particular building
     */
    floors?: BuildingFloorOptions[];
    /**
     * Popup options
     */
    popupOptions?: PopupOptions;
}
