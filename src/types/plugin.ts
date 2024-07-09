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

export interface LabelGroupDefaults {
    /**
     * A font size of labels in a group.
     */
    fontSize?: number;
    /**
     * A font color of labels in a group.
     */
    fontColor?: string;
    /**
     * Image settings for a text background of labels in a group.
     */
    image?: LabelImage;
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
     * Strategies for loading and rendering of models:
     * - dontWaitAll - show every model on its loading completion. In case of a realty scene it allows to download less data and
     * show every model in the scene as soon as possible, but there will be a delay between switching floor plans if they are not loaded.
     * - waitAll - show models only when all models are loaded. In case of a realty scene it leads to an increase in amount of
     * loaded data and time of rendering scene, but it allows to avoid a delay between switching floor plans.
     */
    modelsLoadStrategy?: 'dontWaitAll' | 'waitAll';
    /**
     * Defaults for any label group used when such options aren't specified in label group options directly.
     */
    labelGroupDefaults?: LabelGroupDefaults;
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
    /**
     * Draw order of plugin objects (models and labels).
     * It may be useful when other map objects (such as markers, shapes, etc.) need to be added
     * on the map so that user could manage draw order of the plugin and these objects.
     */
    zIndex?: number;

    minZoom?: number;
    maxZoom?: number;
    modelsNearCameraFade?: number;
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
     * Interactivity of a model. The model isn't interactive by default.
     */
    interactive?: boolean;

    minZoom?: number;
    maxZoom?: number;
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
     * An elevation of a label in meters.
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
    /**
     * Interactivity of a label. The label isn't interactive by default.
     */
    interactive?: boolean;
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
     * An elevation of a label group in meters.
     */
    elevation: number;
    /**
     * An array of labels to add on the map
     */
    labels: LabelOptions[];
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
    /**
     * Image settings for labels' text background.
     */
    image?: LabelImage | 'default';
    /**
     * Interactivity of a label group. The label group isn't interactive by default.
     */
    interactive?: boolean;
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
