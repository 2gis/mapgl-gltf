import * as THREE from 'three';
import type { Map } from '@2gis/mapgl/types';

import { mapPointFromLngLat } from './utils';

interface PluginOptions {
    posLngLat: number[];
}

export class ThreeJsPlugin {
    private renderer = new THREE.WebGLRenderer();
    private camera = new THREE.PerspectiveCamera();
    private scene = new THREE.Scene();
    private mesh = new THREE.Mesh();
    private tmpMatrix = new THREE.Matrix4();
    private map: Map;
    private meshPosition: number[];

    constructor(map: Map, options: PluginOptions) {
        this.map = map;
        this.meshPosition = mapPointFromLngLat(options.posLngLat);

        map.once('idle', () => {
            map.addLayer({
                id: 'my',
                type: 'custom',
                onAdd: () => this.initThree(),
                render: () => this.render(),
                onRemove: () => console.log('remove custom layer external callback'),
            });
        });
    }

    private render() {
        this.camera.projectionMatrix.fromArray((this.map as any)._impl.modules.camera.projectionMatrix);
        this.camera.projectionMatrixInverse.copy(this.camera.projectionMatrix).invert();

        this.tmpMatrix.fromArray(this.map.getProjectionMatrix());
        this.camera.matrixWorldInverse.multiplyMatrices(this.camera.projectionMatrixInverse, this.tmpMatrix);

        this.camera.matrixWorld.copy(this.camera.matrixWorldInverse).invert();
        this.camera.matrix.copy(this.camera.matrixWorld);
        this.camera.matrix.decompose(this.camera.position, this.camera.quaternion, this.camera.scale);

        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
    }

    private initThree() {
        this.camera = new THREE.PerspectiveCamera();

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.map.getCanvas(),
            context: this.map.getWebGLContext(),
            antialias: window.devicePixelRatio < 2,
        });
        this.renderer.autoClear = false;

        const light = new THREE.AmbientLight(0x404040);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 0, 1);

        this.scene.add(light, directionalLight);

        const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
        const material = new THREE.MeshNormalMaterial();

        this.mesh = new THREE.Mesh( geometry, material );
        const mapPointCenter = [this.meshPosition[0], this.meshPosition[1], 0];
        const k = 20000;
        this.mesh.scale.set(k, k, k);
        this.mesh.position.set(mapPointCenter[0], mapPointCenter[1], k / 2);
        this.scene.add( this.mesh );
    }
}
