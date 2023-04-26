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
    color: ColorRepresentation;
    intencity: number;
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
     * Scale of the model
     */
    scale?: number;
}
