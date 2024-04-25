import { BuildingFloorOptionsInternal, BuildingOptionsInternal, ModelOptions } from '../types';

export function getBuildingModelOptions(building: BuildingOptionsInternal): ModelOptions {
    return {
        modelId: building.modelId,
        coordinates: building.coordinates,
        modelUrl: building.modelUrl,
        rotateX: building.rotateX,
        rotateY: building.rotateY,
        rotateZ: building.rotateZ,
        offsetX: building.offsetX,
        offsetY: building.offsetY,
        offsetZ: building.offsetZ,
        scale: building.scale,
        linkedIds: building.linkedIds,
        interactive: building.interactive,
    };
}

export function getFloorModelOptions({
    buildingOptions,
    id,
    modelUrl,
}: BuildingFloorOptionsInternal): ModelOptions {
    return {
        modelId: getFloorModelId(buildingOptions.modelId, id),
        coordinates: buildingOptions.coordinates,
        modelUrl,
        rotateX: buildingOptions.rotateX,
        rotateY: buildingOptions.rotateY,
        rotateZ: buildingOptions.rotateZ,
        offsetX: buildingOptions.offsetX,
        offsetY: buildingOptions.offsetY,
        offsetZ: buildingOptions.offsetZ,
        scale: buildingOptions.scale,
        linkedIds: buildingOptions.linkedIds,
        interactive: buildingOptions.interactive,
    };
}

export function getFloorModelId(buildingModelId: string, floorId: string) {
    return `${buildingModelId}_${floorId}`;
}

export function getFloorPoiGroupId(buildingModelId: string, floorId: string, poiGroupId: string) {
    return `${buildingModelId}_${floorId}_${poiGroupId}`;
}

export function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
