import type { Map } from '@2gis/mapgl/types';
import { GltfPlugin } from '../src';

declare global {
    interface Window {
        map: Map;
        gltfPlugin: GltfPlugin;
        GltfPlugin: typeof GltfPlugin;
        ready: boolean;
    }
}
