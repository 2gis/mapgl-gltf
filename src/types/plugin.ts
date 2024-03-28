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
     * A position of the control.
     */
    position: ControlPosition;
}

/**
 * Options for the hover state of models.
 */
export interface HoverOptions {
    /**
     * A hover color.
     */
    color: string;
}

/**
 * Options for the plugin.
 */
export interface PluginOptions {
    /**
     * A URL which is used for resolving of a model's relative path.
     */
    modelsBaseUrl?: string;
    /**
     * Strategies for loading of models:
     * - dontWaitAll - show models as soon as possible.
     * - waitAll - show models only when all models are ready for rendering.
     */
    modelsLoadStrategy?: 'dontWaitAll' | 'waitAll';
    /**
     * Settings for floors' control.
     */
    floorsControl?: ControlOptions;
    /**
     * Settings of hovered models.
     */
    hoverOptions?: HoverOptions;
    /**
     * Color for the ground covering when an underground floor's plan is shown.
     */
    groundCoveringColor?: string;
}

/**
 * State for the building's scene.
 */
export interface BuildingState {
    /**
     * An identifier of the building's model.
     */
    buildingId: string;

    /**
     * An identifier of the floor's model.
     */
    floorId?: string;
}

/**
 * Options for a model.
 */
export interface ModelOptions {
    /**
     * An identifier of a model should be unique for every model.
     */
    modelId: string;
    /**
     * Geographical coordinates [longitude, latitude].
     */
    coordinates: number[];
    /**
     * URL where a model is located.
     */
    modelUrl: string;
    /**
     * Rotation of a model in degrees about the X axis.
     */
    rotateX?: number;
    /**
     * Rotation of a model in degrees about the Y axis.
     */
    rotateY?: number;
    /**
     * Rotation of a model in degrees about the Z axis.
     */
    rotateZ?: number;
    /**
     * Offset of a model along the X axis in meters.
     */
    offsetX?: number;
    /**
     * Offset of a model along the Y axis in meters.
     */
    offsetY?: number;
    /**
     * Offset of a model along the Z axis in meters.
     */
    offsetZ?: number;
    /**
     * Scale of a model.
     */
    scale?: number;
    /**
     * A list of buildings' identifiers that should be hidden.
     */
    linkedIds?: string[];
    /**
     * User specific data.
     */
    userData?: any;
    /**
     * Interactivity of model. All models are interactive by default.
     */
    interactive?: boolean;
}

/**
 * Options for a label.
 */
export interface LabelOptions {
    /**
     * Coordinates of a label.
     */
    coordinates: [number, number];
    /**
     * An elevation of a label.
     */
    elevation?: number;
    /**
     * A text of a label.
     */
    text: string;
    /**
     * User specific data.
     */
    userData?: any;
}

/**
 * Options for a label group.
 */
export interface LabelGroupOptions {
    /**
     * An identifier of a label group to add.
     */
    id: string;
    /**
     * An elevation of a label group.
     */
    elevation: number;
    /**
     * An array of labels to add on the map
     */
    labels: LabelOptions[];
    /**
     * Image settings for labels' text background.
     */
    image?: LabelImage;
    /**
     * A minimum display styleZoom of a label group.
     */
    minZoom?: number;
    /**
     * A maximum display styleZoom of a label group.
     */
    maxZoom?: number;
    /**
     * A size of a label's font.
     */
    fontSize?: number;
    /**
     * A color of a label's font.
     */
    fontColor?: string;
}

/**
 * Status of a model.
 * There can be no model or it can be loading or loaded.
 */
export enum ModelStatus {
    NoModel,
    Loading,
    Loaded,
}
