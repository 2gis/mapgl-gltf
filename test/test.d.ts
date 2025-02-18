import type { Map } from '@2gis/mapgl/types';
import { SinonSpy } from 'sinon';
import { GltfPlugin } from '../src';
import { MOCKS } from './mocks';

declare global {
    interface Window {
        map: Map;
        gltfPlugin: GltfPlugin;
        GltfPlugin: typeof GltfPlugin;
        ready: boolean;
        MOCKS: typeof MOCKS;
        spy: SinonSpy<any>;
    }
}
