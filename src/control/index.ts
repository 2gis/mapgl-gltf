import icon_building from 'raw-loader!./icon_building.svg';
import icon_parking from 'raw-loader!./icon_parking.svg';
import { Control } from './control';
import classes from './control.module.css';
import type { GltfPlugin } from '@2gis/mapgl/types';
import type { Map as MapGL, ControlOptions } from '@2gis/mapgl/types';
import { ModelFloorPlanShowEvent } from '../types/events';

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
 * A control for change floor layer level on the plugin.
 * It appears on the map only if you set the `floorControl` option within @type PluginOptions to `true`.
 * @hidden
 * @internal
 */
export class GltfFloorControl extends Control {
    private _map: MapGL;
    private _pluginGltf: GltfPlugin;
    private _root: HTMLElement;
    private _content: HTMLElement;
    private _contentHome: HTMLElement;
    private _floor:
        | undefined
        | { currentFloorLevelKey: number | string; floorPlanId: string | number };

    private _handlers: WeakMap<ChildNode, () => void>;

    constructor(plugin: GltfPlugin, map: MapGL, options: ControlOptions) {
        super(map, content, options);
        this._pluginGltf = plugin;
        this._map = map;
        this._root = this._wrap.querySelector(`.${classes.root}`) as HTMLElement;
        this._content = this._wrap.querySelector(`.${classes.content}`) as HTMLElement;
        this._contentHome = this._wrap.querySelector(`.${classes.contentHome}`) as HTMLElement;
        this._handlers = new WeakMap();
        this._root.style.display = 'none';

        plugin.on('showModelFloorPlan', this._showControl);
        plugin.on('hideModelFloorPlan', this._hideControl);
        plugin.on('changeModelFloorPlan', this._onLevelChange);
    }

    public destroy() {
        this._pluginGltf.off('showModelFloorPlan', this._showControl);
        this._pluginGltf.off('hideModelFloorPlan', this._hideControl);
        this._pluginGltf.off('changeModelFloorPlan', this._onLevelChange);

        this._removeButtonsEventListeners();

        super.destroy();
    }

    private _removeButtonsEventListeners = () => {
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
    };

    private _showControl = (ev: ModelFloorPlanShowEvent) => {
        const { currentFloorLevelKey, floorPlanId, floorLevels } = ev;
        this._floor = { currentFloorLevelKey, floorPlanId };
        this._root.style.display = 'block';
        this._content.innerHTML = '';
        this._contentHome.innerHTML = '';
        let currentButton: HTMLElement | undefined;

        floorLevels.forEach(({ floorLevelKey, floorLevelName, floorLevelIcon }) => {
            const rootContent = floorLevelKey === 'building' ? this._contentHome : this._content;
            const button = document.createElement('button');
            let buttonContent = floorLevelName;
            if (floorLevelIcon) {
                buttonContent = `<img src = "${floorLevelIcon}">`;
                if (floorLevelIcon === 'parking') {
                    buttonContent = icon_parking;
                }
                if (floorLevelIcon === 'building') {
                    buttonContent = icon_building;
                }
            }
            button.className = classes.control;
            button.innerHTML = `<div class="${classes.label}">${buttonContent}</div>`;
            button.name = floorLevelKey.toLocaleString();
            if (currentFloorLevelKey === floorLevelKey) {
                button.disabled = true;
                currentButton = button;
            }

            const handler = this._controlHandler(floorLevelKey);
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
    };

    private _hideControl = () => {
        this._removeButtonsEventListeners();

        this._floor = undefined;
        this._root.style.display = 'none';
    };

    private _onLevelChange = (ev: any) => {
        this._switchCurrentFloorLevel(ev.floorLevelKey);
    };

    private _controlHandler = (floorLevelKey: number | string) => () => {
        this._switchCurrentFloorLevel(floorLevelKey);

        if (this._floor) {
            // todo call plugin method of change floor model
            console.log(this._floor);
        }
    };

    private _switchCurrentFloorLevel = (floorLevelKey: number | string) => {
        if (!this._floor) {
            return;
        }

        const buttonToDisabled: HTMLButtonElement | null = this._wrap.querySelector(
            `.${classes.control}[name="${this._floor.currentFloorLevelKey}"]`,
        );
        if (buttonToDisabled) {
            buttonToDisabled.disabled = false;
        }

        const buttonToEnabled: HTMLButtonElement | null = this._wrap.querySelector(
            `.${classes.control}[name="${floorLevelKey}"]`,
        );
        if (buttonToEnabled) {
            buttonToEnabled.disabled = true;
        }

        this._floor.currentFloorLevelKey = floorLevelKey;
    };
}
