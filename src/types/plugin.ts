import type { LabelImage } from '@2gis/mapgl/types';

/**
 * Possible positions of the control.
 */
export type ControlPosition =
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'centerLeft'
    | 'centerRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight';

/**
 * Control initialization options.
 */
export interface ControlOptions {
    /**
     * Position of the control.
     */
    position: ControlPosition;
}

/**
 * Options for the hover state of models
 */
export interface HoverOptions {
    /**
     * Hover color
     * @default '#ffffff'
     */
    color: string;
}

/**
 * Options for the plugin
 */
export interface PluginOptions {
    /**
     * The url which is used for resolving of a model's relative url
     */
    modelsBaseUrl?: string;
    /**
     * Strategies for the loading of models:
     * - dontWaitAll - show models as soon as possible
     * - waitAll - show models only when all models are ready for the rendering
     */
    modelsLoadStrategy?: 'dontWaitAll' | 'waitAll';
    /**
     * Settings for floors' control
     */
    floorsControl?: ControlOptions;
    /**
     * Settings of the hovered models
     */
    hoverOptions?: HoverOptions;
    /**
     * Color for the ground covering when an underground floor's plan is shown.
     */
    groundCoveringColor?: string;
}

/**
 * State for the building's scene
 */
export interface BuildingState {
    /**
     * Identifier of the building's model
     */
    buildingId: string;

    /**
     * Identifier of the floor's model
     */
    floorId?: string;
}

/**
 * Options for a model
 */
export interface ModelOptions {
    /**
     * Identifier of the model should be unique for every model
     */
    modelId: string;
    /**
     * Geographical coordinates [longitude, latitude]
     */
    coordinates: number[];
    /**
     * Url where the model is located
     */
    modelUrl: string;
    /**
     * Rotation of the model in degrees about the X axis
     */
    rotateX?: number;
    /**
     * Rotation of the model in degrees about the Y axis
     */
    rotateY?: number;
    /**
     * Rotation of the model in degrees about the Z axis
     */
    rotateZ?: number;
    /**
     * Offset of the model along the X axis in meters
     */
    offsetX?: number;
    /**
     * Offset of the model along the Y axis in meters
     */
    offsetY?: number;
    /**
     * Offset of the model along the Z axis in meters
     */
    offsetZ?: number;
    /**
     * Scale of the model
     */
    scale?: number;
    /**
     * List of buildings' identifiers that should be hidden
     */
    linkedIds?: string[];
    /**
     * User specific data
     */
    userData?: any;
    /**
     * Interactivity of model. All models are interactive by default
     */
    interactive?: boolean;
}

/**
 * Options for a poi
 */
export interface LabelOptions {
    /**
     * Coordinate of the poi
     */
    coordinates: [number, number];
    /**
     * Elevation of the poi
     */
    elevation?: number;
    /**
     * Elevation of the poi
     */
    text: string;
    /**
     * User specific data
     */
    userData?: any;
}

/**
 * Options for a poi group
 */
export interface LabelGroupOptions {
    /**
     * Identifier of the poi group to add
     */
    id: string;
    /**
     * Elevation of the group of poi
     */
    elevation: number;
    /**
     * Array of poi to add on the map
     */
    labels: LabelOptions[];
    /**
     * Type of the poi
     */
    image?: LabelImage;
    /**
     * Minimum display styleZoom of the poi group
     */
    minZoom?: number;
    /**
     * Maximum display styleZoom of the poi group
     */
    maxZoom?: number;
    /**
     * Size of the poi's font
     */
    fontSize?: number;
    /**
     * Color of the poi's font
     */
    fontColor?: string;
}

export enum ModelStatus {
    NoModel,
    Loading,
    Loaded,
}
