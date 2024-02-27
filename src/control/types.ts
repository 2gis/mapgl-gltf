import { Id } from '../types/plugin';

/**
 * Floor level data
 */
export interface FloorLevel {
    originalId: Id; // пользовательский id этажа или здания
    modelId: Id; // id модели этажа или здания
    buildingModelId: Id; // id модели здания
    text: string;
    icon?: 'parking' | 'building' | string;
}

/**
 * Options for the method show
 */
export interface ControlShowOptions {
    buildingModelId: Id;
    activeModelId: Id;
    floorLevels?: FloorLevel[];
}

/**
 * Event that emitted on button presses of the control
 */
export interface FloorChangeEvent {
    buildingId: Id;
    floorId?: Id;
}

export interface ControlEventTable {
    /**
     * Emitted when floor's plan was changed
     */
    floorchange: FloorChangeEvent;
}
