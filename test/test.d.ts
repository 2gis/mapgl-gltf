import type { Map } from '@2gis/mapgl/types';
import { GltfPlugin } from '../src';
import { OBJECTS_FOR_TESTS } from './utils';

declare global {
    interface Window {
        map: Map;
        gltfPlugin: GltfPlugin;
        GltfPlugin: typeof GltfPlugin;
        ready: boolean;
        OBJECTS_FOR_TESTS: OBJECTS_FOR_TESTS;
    }
}
