import type { PluginOptions } from './types/plugin';

export const defaultOptions: Required<PluginOptions> = {
    ambientLight: {
        color: '#ffffff',
        intencity: 3,
    },
    hoverHighlight: {
        color: '#ffffff',
        intencity: 0.0,
    },
    dracoScriptsUrl: 'https://unpkg.com/@2gis/mapgl-gltf@^1/dist/libs/draco/',
    modelsBaseUrl: '',
    modelsLoadStrategy: 'waitAll',
    poiConfig: {
        primary: {
            fontSize: 14,
            fontColor: '#000000',
        },
        secondary: {
            fontSize: 14,
            fontColor: '#000000',
        },
    },
    floorsControl: {
        position: 'centerLeft',
    },
    groundCoveringColor: '#F8F8EBCC',
};
