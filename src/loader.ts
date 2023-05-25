import * as THREE from 'three';
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';

import { degToRad } from './utils/common';
import { concatUrl, isAbsoluteUrl } from './utils/url';
import { mapPointFromLngLat, geoToMapDistance } from './utils/geo';

import type { ModelOptions } from './types/plugin';

interface LoaderOptions {
    dracoScriptsUrl: string;
    modelsBaseUrl: string;
}

export class Loader extends GLTFLoader {
    private options: LoaderOptions;
    private models = new Map<string, THREE.Object3D>();

    constructor(options: LoaderOptions) {
        super();

        this.options = options;

        const loadingManager = new THREE.LoadingManager();
        const dracoLoader = new DRACOLoader(loadingManager).setDecoderPath(options.dracoScriptsUrl);
        this.setDRACOLoader(dracoLoader);
    }

    public loadModel(modelOptions: ModelOptions) {
        const {
            id,
            coordinates,
            modelUrl,
            rotateX = 0,
            rotateY = 0,
            rotateZ = 0,
            scale = 1,
            offsetX = 0,
            offsetY = 0,
            offsetZ = 0,
        } = modelOptions;
        const modelPosition = mapPointFromLngLat(coordinates);
        const mapPointsOffsetX = geoToMapDistance(coordinates, offsetX);
        const mapPointsOffsetY = geoToMapDistance(coordinates, offsetY);
        const mapPointsOffsetZ = geoToMapDistance(coordinates, offsetZ);

        let actualModelUrl = isAbsoluteUrl(modelUrl)
            ? modelUrl
            : concatUrl(this.options.modelsBaseUrl, modelUrl);

        return new Promise<void>((resolve, reject) => {
            this.load(
                actualModelUrl,
                (gltf: GLTF) => {
                    gltf.scene.traverse((object: THREE.Object3D) => {
                        if (object instanceof THREE.Mesh) {
                            object.userData.modelId = id;
                        }
                    });

                    const model = new THREE.Object3D();
                    model.add(gltf.scene);

                    // rotation
                    model.rotateX(degToRad(rotateX));
                    model.rotateY(degToRad(rotateY));
                    model.rotateZ(degToRad(rotateZ));
                    // scaling
                    model.scale.set(scale, scale, scale);
                    // position
                    const mapPointCenter = [
                        modelPosition[0] + mapPointsOffsetX,
                        modelPosition[1] + mapPointsOffsetY,
                        mapPointsOffsetZ,
                    ];
                    model.position.set(mapPointCenter[0], mapPointCenter[1], mapPointCenter[2]);

                    const modelId = String(id);
                    try {
                        if (this.models.has(modelId)) {
                            throw new Error(
                                `Model with id "${modelId}" already exists. Please use different identifiers for models`,
                            );
                        }
                    } catch (e) {
                        reject(e);
                        return;
                    }
                    this.models.set(modelId, model);

                    resolve();
                },
                () => {},
                (e) => {
                    reject(e);
                },
            );
        });
    }

    public getModels() {
        return this.models;
    }
}
