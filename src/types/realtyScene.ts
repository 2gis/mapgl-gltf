import type { Id, AddPoiGroupOptions, ModelOptions } from './plugin';

export interface MapOptions {
    center?: number[];
    pitch?: number;
    rotation?: number;
    zoom?: number;
}

export interface BuildingFloorOptions {
    id: Id;
    text: string;
    modelUrl: string;
    icon?: 'building' | 'parking' | string;
    poiGroups?: AddPoiGroupOptions[];
    mapOptions?: MapOptions;
}

export interface BuildingOptions extends ModelOptions {
    mapOptions?: MapOptions;
    floors?: BuildingFloorOptions[];
}
