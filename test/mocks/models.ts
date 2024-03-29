import { BuildingOptions } from '../../src/types/realtyScene';

export const MODEL_CUBE_BIG: BuildingOptions = {
    modelId: '1',
    coordinates: [82.886554, 54.98085],
    modelUrl: `${location.origin}/models/cube_draco.glb`,
    scale: 3,
};

export const MODEL_CUBE_SMALL: BuildingOptions = {
    modelId: '2',
    coordinates: [82.886454, 54.980588],
    modelUrl: `${location.origin}/models/cube_draco.glb`,
    rotateZ: 31,
    scale: 1,
};
