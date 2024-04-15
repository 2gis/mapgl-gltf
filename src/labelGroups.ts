import type { Map as MapGL, Label, LabelImage } from '@2gis/mapgl/types';
import type { BuildingState, LabelGroupOptions, PluginOptions } from './types/plugin';
import type { GltfPlugin } from './plugin';
// import { pluginEvents } from './constants';
// import { createLabelEvenData } from './utils/events';

export const DEFAULT_FONT_SIZE = 14;
export const DEFAULT_FONT_COLOR = '#000000';
export const DEFAULT_IMAGE: LabelImage = {
    url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHZpZXdCb3g9IjAgMCAyOCAyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjgiIGhlaWdodD0iMjgiIHJ4PSI0IiBmaWxsPSIjZWFlYWVhIi8+PHJlY3QgeD0iMSIgeT0iMSIgd2lkdGg9IjI2IiBoZWlnaHQ9IjI2IiByeD0iMyIgZmlsbD0id2hpdGUiLz48L3N2Zz4=',
    size: [38, 38],
    stretchX: [[4, 24]],
    stretchY: [[4, 24]],
    padding: [5, 10, 5, 10],
};

export class LabelGroups {
    private labelsByGroupId: Map<string, Label[]> = new Map();

    constructor(
        private map: MapGL,
        private plugin: GltfPlugin,
        private options: Required<PluginOptions>,
    ) {}

    public add(groupOptions: LabelGroupOptions, state?: BuildingState) {
        const { id } = groupOptions;
        if (this.labelsByGroupId.has(id)) {
            console.error(
                `Poi group with id "${id}" already exists. Please use different identifiers for poi groups`,
            );
            return;
        }

        const { image, minZoom, maxZoom, fontColor, fontSize } = groupOptions;
        const { labelGroupDefaults, zIndex } = this.options;

        const labels = groupOptions.labels.map((labelOptions) => {
            const { coordinates, text, userData } = labelOptions;
            const label = new mapgl.Label(this.map, {
                coordinates, // + label.elevation ?? groupOptions.elevation
                text,
                userData,
                image: image === 'default' ? labelGroupDefaults.image ?? DEFAULT_IMAGE : image,
                minZoom,
                maxZoom,
                color: fontColor ?? labelGroupDefaults.fontColor ?? DEFAULT_FONT_COLOR,
                fontSize: fontSize ?? labelGroupDefaults.fontSize ?? DEFAULT_FONT_SIZE,
                relativeAnchor: [0.5, 1],
                zIndex: zIndex + 0.00001, // чтобы были выше моделей
            });

            // pluginEvents.forEach((eventType) => {
            //     label.on(eventType, (ev) => {
            //         this.plugin.emit(eventType, createLabelEvenData(ev, labelOptions, state));
            //     });
            // });

            return label;
        });

        this.labelsByGroupId.set(id, labels);
    }

    public remove(id: string) {
        const labels = this.labelsByGroupId.get(id);
        this.labelsByGroupId.delete(id);
        labels?.forEach((label) => label.destroy());
    }

    public destroy() {
        this.labelsByGroupId.forEach((labels) => {
            labels.forEach((label) => label.destroy());
        });
        this.labelsByGroupId.clear();
    }
}
