import type { DynamicObjectPointerEvent, GltfModel, Label } from '@2gis/mapgl/types';
import {
    BuildingState,
    GltfPluginLabelEvent,
    GltfPluginModelEvent,
    LabelOptions,
    LabelTarget,
    ModelOptions,
} from '../types';

export const createModelEventData = (
    ev: DynamicObjectPointerEvent<GltfModel>,
    data: ModelOptions,
): GltfPluginModelEvent => ({
    originalEvent: ev.originalEvent,
    point: ev.point,
    lngLat: ev.lngLat,
    target: {
        type: 'model',
        modelId: data.modelId,
        data,
    },
});

export const createLabelEvenData = (
    ev: DynamicObjectPointerEvent<Label>,
    data: LabelOptions,
    state?: BuildingState,
): GltfPluginLabelEvent => {
    const target: LabelTarget = {
        type: 'label',
        data,
    };

    if (state?.buildingId !== undefined) {
        target.buildingId = state.buildingId;
    }

    if (state?.floorId !== undefined) {
        target.floorId = state.floorId;
    }

    return {
        originalEvent: ev.originalEvent,
        point: ev.point,
        lngLat: ev.lngLat,
        target,
    };
};
