import type { PluginOptions } from './types/plugin';

export const defaultOptions: Required<PluginOptions> = {
    hoverOptions: {
        color: '#ffffff',
    },
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
