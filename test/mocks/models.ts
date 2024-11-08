import { BuildingOptions } from '../../src/types/realtyScene';

export const MODEL_CUBE_MID: BuildingOptions = {
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

export const MODEL_CUBE_BIG: BuildingOptions = {
    modelId: '3',
    coordinates: [82.886554, 54.98085],
    modelUrl: `${location.origin}/models/cube_draco.glb`,
    scale: 10,
};

export const MODEL_PALM: BuildingOptions = {
    modelId: '4',
    coordinates: [82.88378289287995, 54.90501866207913],
    modelUrl: `${location.origin}/models/palm.glb`,
    scale: 3,
};

export const MODEL_PINE: BuildingOptions = {
    modelId: '5',
    coordinates: [82.88520478969967, 54.90440124749836],
    modelUrl: `${location.origin}/models/pine.glb`,
    scale: 3,
};
