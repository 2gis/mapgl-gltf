import * as _mapgl from '@2gis/mapgl/types';
import { GltfPlugin as GltfPluginOriginal } from './src';

declare module '@2gis/mapgl/types' {
    let GltfPlugin: typeof GltfPluginOriginal;

    export interface Map {
        getProjectionMatrixForGltfPlugin(): number[];
        setHiddenObjects(ids: string[]): void;
    }
}

interface MapglPluginsRegistry {
    GltfPlugin: typeof GltfPluginOriginal;
}

declare global {
    const mapgl: typeof _mapgl;
    interface Window {
        __mapglPlugins: Partial<MapglPluginsRegistry>;
    }
}
