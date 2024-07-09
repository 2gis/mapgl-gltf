import { DEFAULT_FONT_COLOR, DEFAULT_FONT_SIZE, DEFAULT_IMAGE } from './labelGroups';
import type { PluginOptions } from './types/plugin';

export const defaultOptions: Required<PluginOptions> = {
    hoverOptions: {
        color: '#ffffff',
    },
    modelsBaseUrl: '',
    modelsLoadStrategy: 'waitAll',
    modelsNearCameraFade: 2500,
    labelGroupDefaults: {
        fontSize: DEFAULT_FONT_SIZE,
        fontColor: DEFAULT_FONT_COLOR,
        image: DEFAULT_IMAGE,
    },
    floorsControl: {
        position: 'centerLeft',
    },
    groundCoveringColor: '#F8F8EBCC',
    zIndex: 0,
    minZoom: -Infinity,
    maxZoom: Infinity,
};
