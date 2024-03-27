import type { GeoJsonSourceOptions } from '@2gis/mapgl/types';

export const PLUGIN_PREFIX = '__mapglPlugins_mapgl-gltf2';

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

export const GROUND_COVERING_SOURCE_PURPOSE = `${PLUGIN_PREFIX}-covering`;
export const GROUND_COVERING_LAYER_ID = `${PLUGIN_PREFIX}-covering`;
export const GROUND_COVERING_LAYER = {
    id: GROUND_COVERING_LAYER_ID,
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

export const pluginEvents = ['click', 'mousemove', 'mouseover', 'mouseout'] as const;
