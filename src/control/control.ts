import type { Map as MapGL, ControlPosition, ControlOptions } from '@2gis/mapgl/types';

/**
 * Class for the map's controls creating.
 */
export class Control {
    /**
     * @hidden
     * @internal
     */
    protected _wrap: HTMLDivElement;

    private _controlPane: any;
    private _container: HTMLDivElement;
    private _position: ControlPosition;

    /**
     * Example:
     * ```js
     * const control = new mapgl.Control(
     *     map,
     *     '<button>Some text</button>',
     *     { position: 'topLeft' },
     * );
     * ```
     * @param map The map instance.
     * @param content Control HTML content.
     * @param options Control options.
     */
    constructor(map: MapGL, content: string, options: ControlOptions) {
        const { position } = options;
        this._wrap = document.createElement('div');
        this._wrap.style.userSelect = 'none';
        this._wrap.innerHTML = content;

        this._position = position;
        this._controlPane = (map as any)._controlPane;
        this._container = this._controlPane.getContainerByPosition(position);
        this._container?.append(this._wrap);
    }

    /**
     * Destroys the control.
     */
    public destroy(): void {
        this._wrap.remove();
    }

    /**
     * Returns the position of the control.
     */
    public getPosition(): ControlPosition {
        return this._position;
    }

    /**
     * Sets the position of the control.
     * @param position Required position of the control.
     */
    public setPosition(position: ControlPosition): void {
        this._container.removeChild(this._wrap);
        this._container = this._controlPane.getContainerByPosition(position);
        this._container.append(this._wrap);
        this._position = position;
    }

    /**
     * Returns the container of the control.
     */
    public getContainer(): HTMLDivElement {
        return this._wrap;
    }
}
