import type { GeoJsonSourceOptions } from '@2gis/mapgl/types';

export const GROUND_COVERING_SOURCE_DATA: GeoJsonSourceOptions['data'] = {
    type: 'Feature',
    properties: {},
    geometry: {
        type: 'Polygon',
        coordinates: [
            [
                [-180, -85],
                [180, -85],
                [180, 85],
                [-180, 85],
                [-180, -85],
            ],
        ],
    },
};

export const GROUND_COVERING_SOURCE_PURPOSE = '__mapglPlugins_mapgl-gltf';
export const GROUND_COVERING_LAYER = {
    id: '__mapglPlugins_mapgl-gltf',
    type: 'polygon',
    style: {
        color: ['to-color', ['sourceAttr', 'color']],
    },
    filter: [
        'all',
        ['match', ['sourceAttr', 'purpose'], [GROUND_COVERING_SOURCE_PURPOSE], true, false],
        ['to-boolean', ['sourceAttr', 'color']],
    ],
};
