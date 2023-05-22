import type { FeatureCollection } from 'geojson';
import type { Map as MapGL, GeoJsonSource } from '@2gis/mapgl/types';

import { PluginOptions } from './types';

interface PoiGroupOptions {
    map: MapGL;
    poiConfig: PluginOptions['poiConfig'];
}

export class PoiGroup {
    private poiSources = new Map<string, GeoJsonSource>();
    private map: MapGL;
    private poiConfig: PluginOptions['poiConfig'];

    constructor(options: PoiGroupOptions) {
        this.map = options.map;
        this.poiConfig = options.poiConfig;
    }

    public async addPoiGroup({
        id,
        type,
        data,
        minZoom = -Infinity,
        maxZoom = +Infinity,
    }: {
        id: string | number;
        type: 'primary' | 'secondary';
        data: FeatureCollection;
        minZoom?: number;
        maxZoom?: number;
    }) {
        const actualId = String(id);
        if (this.poiSources.get(actualId) !== undefined) {
            throw new Error(
                `Poi group with id "${actualId}" already exists. Please use different identifiers for poi groups`,
            );
        }

        // create source with poi
        const source = new mapgl.GeoJsonSource(this.map, {
            data: data,
            attributes: {
                dataType: actualId,
            },
        });
        this.poiSources.set(actualId, source);

        // add style layer for poi
        this.addPoiStyleLayer(actualId, type, minZoom, maxZoom);
    }

    public removePoiGroup(id: string | number) {
        const source = this.poiSources.get(String(id));
        source?.destroy();
        this.map.removeLayer('plugin-poi-' + String(id));
    }

    private addPoiStyleLayer(
        id: string,
        type: 'primary' | 'secondary',
        minzoom: number,
        maxzoom: number,
    ) {
        const isPrimary = type === 'primary';
        const iconPriority = isPrimary ? 7000 : 6000;
        const iconLabelingGroup = isPrimary ? '__overlappedPrimary' : '__overlappedSecondary';
        const iconImage = isPrimary ? 'km_pillar_gray_border' : 'no_image';
        const iconTextColor = isPrimary
            ? this.poiConfig?.primary?.fontColor
            : this.poiConfig?.secondary?.fontColor;
        const iconTextFontSize = isPrimary
            ? this.poiConfig?.primary?.fontSize
            : this.poiConfig?.secondary?.fontSize;

        this.map.addLayer({
            type: 'point',
            id: 'plugin-poi-' + id,
            filter: [
                'all',
                ['match', ['sourceAttr', 'dataType'], [id], true, false],
                ['match', ['get', 'type'], ['immersive_poi'], true, false],
            ],
            style: {
                iconPriority,
                iconLabelingGroup,
                allowElevation: true,
                elevation: ['get', 'elevation'],
                iconImage,
                iconAnchor: [0.5, 1],
                iconOffset: [0, 0],
                iconTextFont: 'Noto_Sans',
                iconTextColor,
                iconTextField: ['get', 'label'],
                iconTextPadding: [5, 10, 5, 10],
                iconTextFontSize,
                duplicationSpacing: 1,
            },
            minzoom,
            maxzoom,
        });
    }
}
