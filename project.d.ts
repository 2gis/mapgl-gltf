import * as _mapgl from '@2gis/mapgl/types';
import { ThreeJsPlugin } from './src';

declare module '@2gis/mapgl/types' {
    export { ThreeJsPlugin };
}

interface MapglPluginsRegistry {
    ThreeJsPlugin: typeof ThreeJsPlugin;
}

declare global {
    const mapgl: typeof _mapgl;
    interface Window {
        __mapglPlugins: Partial<MapglPluginsRegistry>;
    }
}
