import { FloorLevel } from '../control/types';
import type { ModelOptions, LabelGroupOptions } from './plugin';

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
    id: string;
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
    labelGroups?: LabelGroupOptions[];
    /**
     * Map's options to apply after selecting the particular floor
     */
    mapOptions?: MapOptions;
    /**
     * Specifies whether a floor's plan is underground.
     * If value is `true` the map will be covered with a ground geometry
     * so that only the floor's plan will stay visible.
     */
    isUnderground?: boolean;
}

/**
 * Options of popup that appears on hover of buildings
 */
export interface PopupOptions {
    /**
     * Popup's coordinates
     */
    coordinates: number[];
    /**
     * Popup's title
     */
    title: string;
    /**
     * Popup's description
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

export interface RealtySceneState {
    activeModelId?: string;

    // id здания мапится на опции здания или опции этажа этого здания
    buildingVisibility: Map<string, ModelOptions | undefined>;
}

export type BuildingOptionsInternal = Omit<BuildingOptions, 'floors'> & {
    floors: FloorLevel[];
};

export type BuildingFloorOptionsInternal = BuildingFloorOptions & {
    buildingOptions: ModelOptions;
};
