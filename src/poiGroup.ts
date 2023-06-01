import type { Map as MapGL, GeoJsonSource } from '@2gis/mapgl/types';

import type {
    PluginOptions,
    BuildingState,
    AddPoiGroupOptions,
    RemovePoiGroupOptions,
} from './types/plugin';

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

    public addIcons() {
        this.map.addIcon('km_pillar_gray_border', {
            url: 'https://disk.2gis.com/styles/d7e8aed1-4d3f-472a-a1e4-337f4b31ab8a/km_pillar_gray_border',
            // @ts-ignore
            width: 38,
            height: 38,
            stretchX: [[4, 24]],
            stretchY: [[4, 24]],
        });
    }

    public async addPoiGroup(options: AddPoiGroupOptions, state?: BuildingState) {
        const { id, type, data, minZoom = -Infinity, maxZoom = +Infinity } = options;
        const actualId = String(id);
        if (this.poiSources.get(actualId) !== undefined) {
            throw new Error(
                `Poi group with id "${actualId}" already exists. Please use different identifiers for poi groups`,
            );
        }

        data.features.forEach((feature) => {
            if (feature.properties !== null) {
                feature.properties.buildingId = state?.buildingId;
                feature.properties.floorId = state?.floorId;
                feature.properties.poiType = type;
            }
        });

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

    public removePoiGroup(options: RemovePoiGroupOptions) {
        const { id } = options;
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
        let style;
        if (type === 'primary') {
            style = {
                iconPriority: 7000,
                allowElevation: true,
                elevation: ['get', 'elevation'],
                iconImage: 'km_pillar_gray_border',
                iconAnchor: [0.5, 1],
                iconOffset: [0, 0],
                iconTextFont: 'Noto_Sans',
                iconTextColor: this.poiConfig?.primary?.fontColor,
                iconTextField: ['get', 'label'],
                iconTextPadding: [5, 10, 5, 10],
                iconTextFontSize: this.poiConfig?.primary?.fontSize,
                duplicationSpacing: 1,
            };
        } else {
            style = {
                allowElevation: true,
                elevation: ['get', 'elevation'],
                duplicationSpacing: 1,
                textField: ['get', 'label'],
                textFont: 'Noto_Sans',
                textFontSize: this.poiConfig?.secondary?.fontSize,
                textColor: this.poiConfig?.secondary?.fontColor,
                textPriority: 6000,
            };
        }

        this.map.addLayer({
            type: 'point',
            id: 'plugin-poi-' + id,
            filter: [
                'all',
                ['match', ['sourceAttr', 'dataType'], [id], true, false],
                ['match', ['get', 'type'], ['immersive_poi'], true, false],
            ],
            style,
            minzoom,
            maxzoom,
        });
    }
}
