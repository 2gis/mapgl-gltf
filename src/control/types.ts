export type FloorId = number | string | 'building';

/**
 * Floor level data.
 */
export interface FloorLevel {
    floorId: FloorId;
    text: string;
    icon?: 'parking' | 'building' | string;
}

/**
 * Options for the method show
 */
export interface ShowOptions {
    currentFloorId: FloorId;
    floorLevels: FloorLevel[];
}

/**
 * Event that emitted on button presses of the control
 */
export interface FloorChangeEvent {
    floorId: FloorId;
}

export interface ControlEventTable {
    /**
     * Emitted when model floor plan is change.
     */
    floorChange: FloorChangeEvent;
}
