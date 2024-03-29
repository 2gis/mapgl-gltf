import type { Map as MapGL, ControlOptions } from '@2gis/mapgl/types';
import type { ControlShowOptions, FloorLevel } from './types';

import icon_building from 'raw-loader!./icon_building.svg';
import icon_parking from 'raw-loader!./icon_parking.svg';
import classes from './control.module.css';
import { Control } from './control';

const content = /* HTML */ `
    <div class="${classes.root}">
        <div class="${classes.container} ${classes.splitContainer}">
            <div class="${classes.contentHome}" />
        </div>
    </div>
    <div class="${classes.root}">
        <div class="${classes.container} ${classes.containerFloors}">
            <div class="${classes.scroller}">
                <div class="${classes.content}" />
            </div>
        </div>
    </div>
`;

/**
 * A control for change floor layer level in the plugin.
 * It appears on the map only if you set the `floorControl` option within @type PluginOptions to `true`.
 * @hidden
 * @internal
 */
export class GltfFloorControl extends Control {
    private _root: HTMLElement;
    private _content: HTMLElement;
    private _contentHome: HTMLElement;
    private _currentFloorId?: string;

    private _handlers: WeakMap<ChildNode, () => void>;

    constructor(map: MapGL, options: ControlOptions) {
        super(map, content, options);
        this._root = this._wrap.querySelector(`.${classes.root}`) as HTMLElement;
        this._content = this._wrap.querySelector(`.${classes.content}`) as HTMLElement;
        this._contentHome = this._wrap.querySelector(`.${classes.contentHome}`) as HTMLElement;
        this._handlers = new WeakMap();
        this._root.style.display = 'none';
    }

    public show(options: ControlShowOptions) {
        this._removeButtonsEventListeners();

        const { buildingModelId, activeModelId, floorLevels = [] } = options;

        this._currentFloorId = activeModelId;
        this._root.style.display = 'block';
        this._content.innerHTML = '';
        this._contentHome.innerHTML = '';
        let currentButton: HTMLElement | undefined;

        floorLevels.forEach(({ modelId, text, icon }) => {
            const rootContent = modelId === buildingModelId ? this._contentHome : this._content;
            const button = document.createElement('button');
            let buttonContent = text;
            if (icon) {
                buttonContent = `<img src = "${icon}">`;
                if (icon === 'parking') {
                    buttonContent = icon_parking;
                }
                if (icon === 'building') {
                    buttonContent = icon_building;
                }
            }
            button.className = classes.control;
            button.innerHTML = `<div class="${classes.label}">${buttonContent}</div>`;
            button.name = modelId;
            if (this._currentFloorId === modelId) {
                button.disabled = true;
                currentButton = button;
            }

            const handler = this._controlHandler(modelId);
            button.addEventListener('click', handler);

            this._handlers.set(button, handler);
            rootContent.append(button);
        });

        if (currentButton && currentButton.offsetTop) {
            // scroll to the currentButton
            const parent = currentButton.parentElement?.parentElement;

            if (parent) {
                parent.scrollTop = currentButton.offsetTop;
            }
        }
    }

    public hide() {
        this._removeButtonsEventListeners();
        this._currentFloorId = undefined;
        this._root.style.display = 'none';
    }

    public destroy() {
        this._removeButtonsEventListeners();
        super.destroy();
    }

    private _removeButtonsEventListeners() {
        if (!this._content) {
            return;
        }

        this._content.childNodes.forEach((node) => {
            if (this._handlers.has(node)) {
                const handler = this._handlers.get(node);
                if (handler !== undefined) {
                    node.removeEventListener('click', handler);
                }
            }
        });
    }

    private _controlHandler = (modelId: string) => () => {
        this._switchCurrentFloorLevel(modelId);

        this.emit('floorchange', {
            modelId,
        });
    };

    private _switchCurrentFloorLevel(modelId: string) {
        if (this._currentFloorId === undefined) {
            return;
        }

        const buttonToDisabled: HTMLButtonElement | null = this._wrap.querySelector(
            `.${classes.control}[name="${this._currentFloorId}"]`,
        );
        if (buttonToDisabled) {
            buttonToDisabled.disabled = false;
        }

        const buttonToEnabled: HTMLButtonElement | null = this._wrap.querySelector(
            `.${classes.control}[name="${modelId}"]`,
        );
        if (buttonToEnabled) {
            buttonToEnabled.disabled = true;
        }

        this._currentFloorId = modelId;
    }
}
