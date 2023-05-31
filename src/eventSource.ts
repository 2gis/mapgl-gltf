import * as THREE from 'three';
import type { Map as MapGL, MapPointerEvent } from '@2gis/mapgl/types';

import { Evented } from './external/evented';
import { clone } from './utils/common';

import type { GltfPluginEventTable, GltfPluginPointerEvent, PoiOptions } from './types/events';
import type { ModelOptions } from './types/plugin';

export class EventSource extends Evented<GltfPluginEventTable> {
    private prevTargetModel: THREE.Mesh | null = null;
    private raycaster = new THREE.Raycaster();
    private pointer = new THREE.Vector2();
    private eventList: Array<keyof GltfPluginEventTable> = [
        'click',
        'mousemove',
        'mouseover',
        'mouseout',
    ];

    constructor(
        private map: MapGL,
        private viewport: DOMRect,
        private camera: THREE.PerspectiveCamera,
        private scene: THREE.Scene,
    ) {
        super();
        this.initEventHandlers();
    }

    public getEvents() {
        return this.eventList;
    }

    public updateViewport(v: DOMRect) {
        this.viewport = v;
    }

    private getEventTargetMesh(e: MouseEvent | TouchEvent) {
        const { clientX, clientY } = 'changedTouches' in e ? e.changedTouches[0] : e;

        // coordinates of the cursor in local coordinates of map's viewport
        const localX = clientX - this.viewport.x;
        const localY = this.viewport.height - (clientY - this.viewport.y);

        // convert local coordinates of the mouse pointer to WebGL coordinates
        // and use it for the object identification in three.js-scene
        this.pointer.x = (localX / this.viewport.width) * 2 - 1;
        this.pointer.y = (localY / this.viewport.height) * 2 - 1;
        this.raycaster.setFromCamera(this.pointer, this.camera);
        const intersects = this.raycaster.intersectObjects(this.scene.children, true);
        const target = intersects[0] ? intersects[0].object : undefined;

        if (!target || target.type !== 'Mesh') {
            return null;
        }

        return target as THREE.Mesh;
    }

    private getPoiOptions(e: MapPointerEvent) {
        if (
            e.targetData?.type === 'geojson' &&
            e.targetData?.feature?.properties?.type === 'immersive_poi'
        ) {
            return e.targetData.feature.properties;
        }
    }

    private createPoiEventData(
        ev: MapPointerEvent,
        originalData: PoiOptions,
    ): GltfPluginPointerEvent {
        const data = clone(originalData);
        const { userData } = data;
        delete data.userData;

        return {
            originalEvent: ev.originalEvent,
            point: ev.point,
            lngLat: ev.lngLat,
            target: {
                type: 'poi',
                data,
                userData,
            },
        };
    }

    private createModelEventData(ev: MapPointerEvent, data: ModelOptions): GltfPluginPointerEvent {
        return {
            originalEvent: ev.originalEvent,
            point: ev.point,
            lngLat: ev.lngLat,
            target: {
                type: 'model',
                userData: {},
                data,
            },
        };
    }

    private initEventHandlers() {
        /**
         * Poi events
         */
        this.map.on('mousemove', (e) => {
            const poiOptions = this.getPoiOptions(e);
            if (poiOptions) {
                const eventData = this.createPoiEventData(e, poiOptions);
                this.emit('mousemove', eventData);
            }
        });

        this.map.on('mouseover', (e) => {
            const poiOptions = this.getPoiOptions(e);
            if (poiOptions) {
                const eventData = this.createPoiEventData(e, poiOptions);
                this.emit('mouseover', eventData);
            }
        });

        this.map.on('mouseout', (e) => {
            const poiOptions = this.getPoiOptions(e);
            if (poiOptions) {
                const eventData = this.createPoiEventData(e, poiOptions);
                this.emit('mouseout', eventData);
            }
        });

        this.map.on('click', (e) => {
            console.log('originalEvent', e);
            const poiOptions = this.getPoiOptions(e);
            if (poiOptions) {
                const eventData = this.createPoiEventData(e, poiOptions);
                this.emit('click', eventData);
            }
        });

        /**
         * Model events
         */
        this.map.on('click', (e) => {
            const target = this.getEventTargetMesh(e.originalEvent);

            if (target) {
                const modelOptions = target.userData as ModelOptions;
                const eventData = this.createModelEventData(e, modelOptions);
                this.emit('click', eventData);
            }
        });

        this.map.on('mousemove', (e) => {
            const currTargetModel = this.getEventTargetMesh(e.originalEvent);
            if (currTargetModel) {
                const modelOptions = currTargetModel.userData as ModelOptions;
                const currEventData = this.createModelEventData(e, modelOptions);

                // when user move the mouse pointer from the map to a model
                if (this.prevTargetModel === null) {
                    this.emit('mouseover', currEventData);
                    this.emit('mousemove', currEventData);
                    this.prevTargetModel = currTargetModel;
                    return;
                }

                // when user move the mouse pointer on the same model
                if (this.prevTargetModel === currTargetModel) {
                    this.emit('mousemove', currEventData);
                    return;
                }

                // when user move the mouse pointer from one model to another model
                if (this.prevTargetModel !== currTargetModel) {
                    const modelOptions = this.prevTargetModel.userData as ModelOptions;
                    const prevEventData = this.createModelEventData(e, modelOptions);
                    this.emit('mouseout', prevEventData);
                    this.emit('mouseover', currEventData);
                    this.emit('mousemove', currEventData);
                    this.prevTargetModel = currTargetModel;
                    return;
                }
            }

            // when user move the mouse pointer from a model to the map
            if (this.prevTargetModel !== null) {
                const modelOptions = this.prevTargetModel.userData as ModelOptions;
                const prevEventData = this.createModelEventData(e, modelOptions);
                this.emit('mouseout', prevEventData);
                this.prevTargetModel = null;
                return;
            }
        });
    }
}
