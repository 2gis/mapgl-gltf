import * as THREE from 'three';
import type { Map as MapGL, MapPointerEvent } from '@2gis/mapgl/types';

import { Evented } from './external/evented';

import type { GltfPluginEventTable } from './types/events';

export class EventSource extends Evented<GltfPluginEventTable> {
    private prevTargetId: string | null = null;
    private raycaster = new THREE.Raycaster();
    private pointer = new THREE.Vector2();
    private eventList: Array<keyof GltfPluginEventTable> = [
        'clickModel',
        'mousemoveModel',
        'mouseoverModel',
        'mouseoutModel',
        'clickPoi',
        'mousemovePoi',
        'mouseoverPoi',
        'mouseoutPoi',
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

        // convert local coordinates of the corser to WebGL coordinates
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

    private isGeoJsonPoi(e: MapPointerEvent) {
        return (
            e.targetData?.type === 'geojson' &&
            e.targetData?.feature?.properties?.type === 'immersive_poi'
        );
    }

    private getTargetId(target: THREE.Mesh) {
        return target.userData.modelId;
    }

    private getModelEventData(e: MapPointerEvent, id: string) {
        return {
            lngLat: e.lngLat,
            point: e.point,
            originalEvent: e.originalEvent,
            target: {
                id,
            },
        };
    }

    private initEventHandlers() {
        /**
         * Poi events
         */
        this.map.on('mousemove', (e) => {
            if (this.isGeoJsonPoi(e)) {
                this.emit('mousemovePoi', e);
            }
        });

        this.map.on('mouseover', (e) => {
            if (this.isGeoJsonPoi(e)) {
                this.emit('mouseoverPoi', e);
            }
        });

        this.map.on('mouseout', (e) => {
            if (this.isGeoJsonPoi(e)) {
                this.emit('mouseoutPoi', e);
            }
        });

        this.map.on('click', (e) => {
            if (this.isGeoJsonPoi(e)) {
                this.emit('clickPoi', e);
            }
        });

        /**
         * Model events
         */
        this.map.on('click', (e) => {
            const target = this.getEventTargetMesh(e.originalEvent);

            if (target) {
                this.emit('clickModel', {
                    lngLat: e.lngLat,
                    point: e.point,
                    originalEvent: e.originalEvent,
                    target: {
                        id: this.getTargetId(target),
                    },
                });
            }
        });

        this.map.on('mousemove', (e) => {
            const currTarget = this.getEventTargetMesh(e.originalEvent);
            if (currTarget) {
                const currEventData = this.getModelEventData(e, this.getTargetId(currTarget));
                const currTargetId = this.getTargetId(currTarget);

                // move mouse pointer from the map to the object
                if (this.prevTargetId === null) {
                    this.emit('mouseoverModel', currEventData);
                    this.emit('mousemoveModel', currEventData);
                    this.prevTargetId = currTargetId;
                    return;
                }

                // move mouse pointer on the same object
                if (this.prevTargetId === currTargetId) {
                    this.emit('mousemoveModel', currEventData);
                    return;
                }

                // move mouse pointer from one object to another
                if (this.prevTargetId !== currTargetId) {
                    const prevEventData = this.getModelEventData(e, this.prevTargetId);
                    this.emit('mouseoutModel', prevEventData);
                    this.emit('mouseoverModel', currEventData);
                    this.emit('mousemoveModel', currEventData);
                    this.prevTargetId = currTargetId;
                    return;
                }
            } else {
                // move mouse pointer from the object to the map
                if (this.prevTargetId !== null) {
                    const prevEventData = this.getModelEventData(e, this.prevTargetId);
                    this.emit('mouseoutModel', prevEventData);
                    this.prevTargetId = null;
                    return;
                }
            }
        });
    }
}
