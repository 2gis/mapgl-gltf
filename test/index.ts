import * as sinon from 'sinon';
import { GltfPlugin } from '../src';
import { MOCKS } from './mocks';

window.GltfPlugin = GltfPlugin;
window.MOCKS = MOCKS; // storage for any data for tests
window.sinon = sinon;
