import type { FeatureCollection, Feature, Point } from 'geojson';
import type { Map as MapGL, GeoJsonSource } from '@2gis/mapgl/types';

import type {
    PluginOptions,
    BuildingState,
    AddPoiGroupOptions,
    RemovePoiGroupOptions,
    PoiOptions,
} from './types/plugin';
import type { PoiGeoJsonProperties } from './types/events';

interface PoiGroupOptions {
    map: MapGL;
    poiConfig: PluginOptions['poiConfig'];
}

type FeaturePoint = Feature<Point, PoiGeoJsonProperties>;

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

    public async addPoiGroup(groupOptions: AddPoiGroupOptions, state?: BuildingState) {
        const { id, data } = groupOptions;
        const actualId = String(id);
        if (this.poiSources.get(actualId) !== undefined) {
            throw new Error(
                `Poi group with id "${actualId}" already exists. Please use different identifiers for poi groups`,
            );
        }

        const geoJson = this.createGeoJson(data, groupOptions, state);

        // create source with poi
        const source = new mapgl.GeoJsonSource(this.map, {
            data: geoJson,
            attributes: {
                dataType: actualId,
            },
        });
        this.poiSources.set(actualId, source);

        // add style layer for poi
        this.addPoiStyleLayer(groupOptions);
    }

    public removePoiGroup(groupOptions: RemovePoiGroupOptions) {
        const { id } = groupOptions;
        const source = this.poiSources.get(String(id));
        source?.destroy();
        this.map.removeLayer('plugin-poi-' + String(id));
    }

    private createGeoJson(
        poiOptions: PoiOptions[],
        groupOptions: AddPoiGroupOptions,
        state?: BuildingState,
    ): FeatureCollection<Point> {
        const { elevation } = groupOptions;
        const features: FeaturePoint[] = poiOptions.map((opts) => ({
            type: 'Feature',
            properties: {
                // main properties
                type: 'immersive_poi',
                label: opts.label,
                userData: opts.userData,
                elevation: elevation,
                coordinates: opts.coordinates,
                // auxilary properties
                modelId: state?.modelId,
                floorId: state?.floorId,
            },
            geometry: {
                type: 'Point',
                coordinates: opts.coordinates,
            },
        }));

        return {
            type: 'FeatureCollection',
            features,
        };
    }

    private addPoiStyleLayer(groupOptions: AddPoiGroupOptions) {
        const { id, type, minZoom = -Infinity, maxZoom = +Infinity } = groupOptions;
        let { fontSize, fontColor } = groupOptions;
        const actualId = String(id);
        let style;

        if (fontColor === undefined) {
            fontColor =
                type === 'primary'
                    ? this.poiConfig?.primary?.fontColor ?? '#3a3a3a'
                    : this.poiConfig?.secondary?.fontColor ?? '#3a3a3a';
        }
        if (fontSize === undefined) {
            fontSize =
                type === 'primary'
                    ? this.poiConfig?.primary?.fontSize ?? 14
                    : this.poiConfig?.secondary?.fontSize ?? 12;
        }

        if (type === 'primary') {
            style = {
                iconPriority: 7000,
                allowElevation: true,
                elevation: ['get', 'elevation'],
                iconImage: 'km_pillar_gray_border',
                iconAnchor: [0.5, 1],
                iconOffset: [0, 0],
                iconTextFont: 'Noto_Sans',
                iconTextColor: fontColor,
                iconTextField: ['get', 'label'],
                iconTextPadding: [5, 10, 5, 10],
                iconTextFontSize: fontSize,
                duplicationSpacing: 1,
            };
        } else {
            style = {
                allowElevation: true,
                elevation: ['get', 'elevation'],
                duplicationSpacing: 1,
                textField: ['get', 'label'],
                textFont: 'Noto_Sans',
                textFontSize: fontSize,
                textColor: fontColor,
                textPriority: 6000,
            };
        }

        this.map.addLayer({
            type: 'point',
            id: 'plugin-poi-' + actualId,
            filter: [
                'all',
                ['match', ['sourceAttr', 'dataType'], [actualId], true, false],
                ['match', ['get', 'type'], ['immersive_poi'], true, false],
            ],
            style,
            minzoom: minZoom,
            maxzoom: maxZoom,
        });
    }
}
