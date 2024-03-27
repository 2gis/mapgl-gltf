import type { Map as MapGL, Label } from '@2gis/mapgl/types';
import type { BuildingState, LabelGroupOptions } from './types/plugin';
import { GltfPlugin } from './plugin';
// import { pluginEvents } from './constants';
// import { createLabelEvenData } from './utils/events';

export class LabelGroups {
    private labelsByGroupId: Map<string, Label[]> = new Map();

    constructor(private map: MapGL, private plugin: GltfPlugin) {}

    public add(groupOptions: LabelGroupOptions, state?: BuildingState) {
        const { id } = groupOptions;
        if (this.labelsByGroupId.has(id)) {
            console.error(
                `Poi group with id "${id}" already exists. Please use different identifiers for poi groups`,
            );
            return;
        }

        const { image, minZoom, maxZoom, fontColor: color, fontSize } = groupOptions;
        const labels = groupOptions.labels.map((labelOptions) => {
            const { coordinates, text, userData } = labelOptions;
            const label = new mapgl.Label(this.map, {
                coordinates, // + label.elevation ?? groupOptions.elevation
                text,
                userData,
                image,
                minZoom,
                maxZoom,
                color,
                fontSize,
                relativeAnchor: [0.5, 1],
                zIndex: 1, // чтобы были выше моделей
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
