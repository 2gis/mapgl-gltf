import { GltfPlugin } from '../src';
import { OBJECTS_FOR_TESTS } from './utils';
import { realtyScene } from '../demo/realtySceneData';

window.GltfPlugin = GltfPlugin;
window.OBJECTS_FOR_TESTS = OBJECTS_FOR_TESTS; // storage for any data for tests
window.OBJECTS_FOR_TESTS.mapRealtyScene = realtyScene;
