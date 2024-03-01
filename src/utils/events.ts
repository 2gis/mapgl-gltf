import { MapPointerEvent } from '@2gis/mapgl/types';
import { GltfPluginModelEvent, Id, ModelOptions, ModelTarget } from '../types';

export const createModelEventData = (
    ev: MapPointerEvent,
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
