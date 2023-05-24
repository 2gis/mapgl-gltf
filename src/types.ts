import type { MapPointerEvent } from '@2gis/mapgl/types';

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
     * Numeric value of the RGB component of the color.
     * Default is 0xffffff
     */
    color: ColorRepresentation;
    /**
     * Numeric value of the light's strength/intensity.
     * Default is 1
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
}

/**
 * Options for a model
 */
export interface ModelOptions {
    /**
     * Identifier should be unique for every model
     */
    id: number | string;
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
}

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
}
