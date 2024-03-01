import { Id } from '../types/plugin';

/**
 * Floor level data
 */
export interface FloorLevel {
    modelId: Id; // id модели этажа или здания
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
    modelId: Id; // id модели этажа или здания
}

export interface ControlEventTable {
    /**
     * Emitted when floor's plan was changed
     */
    floorchange: FloorChangeEvent;
}
