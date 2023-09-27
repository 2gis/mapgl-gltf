export type Id = string | number;

export type ColorModelString = `${'rgb' | 'hsl'}(${string})`;
export type HexColorString = `#${string}`;
/**
 * Color represantation can be rgb(), hsl(), or hex value
 */
export type ColorRepresentation = ColorModelString | HexColorString | number;

/**
 * Options for an ambient light
 */
export interface AmbientLightOptions {
    /**
     * Color of the ambient light.
     * @default '#ffffff'
     */
    color: ColorRepresentation;
    /**
     * Numeric value of the light's strength/intensity.
     * @default 3
     */
    intencity: number;
}

/**
 * Configuration of the poi
 */
export interface PoiConfigGranular {
    /**
     * Size of the font
     */
    fontSize?: number;
    /**
     * Color of the font
     */
    fontColor?: string;
}

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
 * Options for the highlight color of hovered models
 */
export interface HightlightOptions {
    /**
     * Color of the hover
     * @default '#ffffff'
     */
    color?: ColorRepresentation;
    /**
     * Intensity of the color on the hover in the range from 0 to 1
     * @default 0.0
     */
    intencity: number; // TODO: Исправить опечатку в следующей мажорной версии, должно быть intensity
}

/**
 * Options for the plugin
 */
export interface PluginOptions {
    /**
     * Settings for an ambient light
     */
    ambientLight?: AmbientLightOptions;
    /**
     * The url where scripts for the draco decoder are located
     */
    dracoScriptsUrl?: string;
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
     * Configuration of poi
     */
    poiConfig?: {
        /**
         * Configuration the primary poi
         */
        primary?: PoiConfigGranular;
        /**
         * Configuration the secondary poi
         */
        secondary?: PoiConfigGranular;
    };
    /**
     * Settings for floors' control
     */
    floorsControl?: ControlOptions;
    /**
     * Settings of the highlighted models
     */
    hoverHighlight?: HightlightOptions; // TODO: MAJOR. Переименовать в HighlightOptions в следующем мажорном релизе
}

/**
 * State for the building's scene
 */
export interface BuildingState {
    /**
     * Identifier of the building's model
     */
    modelId: Id;

    /**
     * Identifier of the floor's model
     */
    floorId?: Id;
}

/**
 * Options for a model
 */
export interface ModelOptions {
    /**
     * Identifier of the model should be unique for every model
     */
    modelId: Id;
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
export interface PoiOptions {
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
    label: string;
    /**
     * User specific data
     */
    userData?: any;
}

/**
 * Options for a poi group
 */
export interface PoiGroupOptions {
    /**
     * Identifier of the poi group to add
     */
    id: Id;
    /**
     * Type of the poi
     */
    type: 'primary' | 'secondary';
    /**
     * Elevation of the group of poi
     */
    elevation: number;
    /**
     * Array of poi to add on the map
     */
    data: PoiOptions[];
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
