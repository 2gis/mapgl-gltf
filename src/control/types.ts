import { Id } from '../types/plugin';

/**
 * Floor level data
 */
export interface FloorLevel {
    floorId?: Id;
    text: string;
    icon?: 'parking' | 'building' | string;
}

/**
 * Options for the method show
 */
export interface ControlShowOptions {
    modelId: Id;
    floorId?: Id;
    floorLevels?: FloorLevel[];
}

/**
 * Event that emitted on button presses of the control
 */
export interface FloorChangeEvent {
    modelId: Id;
    floorId?: Id;
}

export interface ControlEventTable {
    /**
     * Emitted when floor's plan was changed
     */
    floorChange: FloorChangeEvent;
}
