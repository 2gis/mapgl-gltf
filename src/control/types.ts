/**
 * Floor level data.
 */
export interface FloorLevel {
    modelId: string; // id модели этажа или здания
    text: string;
    icon?: 'parking' | 'building' | string;
}

/**
 * Options for the show method.
 */
export interface ControlShowOptions {
    buildingModelId: string;
    activeModelId: string;
    floorLevels?: FloorLevel[];
}

/**
 * Event that emitted on button presses of the control.
 */
export interface FloorChangeEvent {
    modelId: string; // id модели этажа или здания
}

export interface ControlEventTable {
    /**
     * Emitted when floor's plan was changed.
     */
    floorchange: FloorChangeEvent;
}
