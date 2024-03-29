import type { PluginOptions } from './types/plugin';

export const defaultOptions: Required<PluginOptions> = {
    hoverOptions: {
        color: '#ffffff',
    },
    modelsBaseUrl: '',
    modelsLoadStrategy: 'waitAll',
    floorsControl: {
        position: 'centerLeft',
    },
    groundCoveringColor: '#F8F8EBCC',
    zIndex: 0,
};
