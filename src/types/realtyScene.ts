import { FloorLevel } from '../control/types';
import type { ModelOptions, LabelGroupOptions } from './plugin';

/**
 * Options for the map.
 */
export interface MapOptions {
    /**
     * Geographical center of the map.
     */
    center?: number[];
    /**
     * Map's pitch angle in degrees.
     */
    pitch?: number;
    /**
     * Map's rotation angle in degrees.
     */
    rotation?: number;
    /**
     * Map's zoom.
     */
    zoom?: number;
}

/**
 * Options for a floor's plan in the realty scene.
 */
export interface BuildingFloorOptions {
    /**
     * An identifier of the floor's plan.
     */
    id: string;
    /**
     * A text to add to the floors' control.
     */
    text: string;
    /**
     * A URL of a model that represents the current floor's plan.
     */
    modelUrl: string;
    /**
     * An icon to add to the floors' control.
     */
    icon?: 'building' | 'parking' | string;
    /**
     * A list of groups of labels connected with the floor's plan.
     */
    labelGroups?: LabelGroupOptions[];
    /**
     * Map's options to apply after selecting the particular floor.
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
 * Options of popup that appears on hover of buildings.
 */
export interface PopupOptions {
    /**
     * Popup's coordinates.
     */
    coordinates: number[];
    /**
     * A popup's title.
     */
    title: string;
    /**
     * A popup's description.
     */
    description?: string;
}

/**
 * Options for a building in the realty scene.
 */
export interface BuildingOptions extends ModelOptions {
    /**
     * Map's options to apply after selecting the particular building.
     */
    mapOptions?: MapOptions;
    /**
     * A list of the floors' plans connected with the particular building.
     */
    floors?: BuildingFloorOptions[];
    /**
     * Popup options.
     */
    popupOptions?: PopupOptions;
}

/**
 * @hidden
 * @internal
 */
export interface RealtySceneState {
    activeModelId?: string;

    // id здания мапится на опции здания или опции этажа этого здания
    buildingVisibility: Map<string, ModelOptions | undefined>;
}

/**
 * @hidden
 * @internal
 */
export type BuildingOptionsInternal = Omit<BuildingOptions, 'floors'> & {
    floors: FloorLevel[];
};

/**
 * @hidden
 * @internal
 */
export type BuildingFloorOptionsInternal = BuildingFloorOptions & {
    buildingOptions: ModelOptions;
};
