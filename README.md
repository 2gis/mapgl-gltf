# mapgl-gltf

Plugin for the rendering glTF models with MapGL

## The basic usage via npm package

Install `@2gis/mapgl` and `@2gis/mapgl-gltf` packages:

```shell
npm install @2gis/mapgl
npm install @2gis/mapgl-gltf
```

Import mapgl and plugin into your project:

```js
import { load } from '@2gis/mapgl';
import { GltfPlugin } from '@2gis/mapgl-gltf';

const mapglAPI = await load();

const map = new mapglAPI.Map('container', {
    center: [82.886554, 54.980988],
    zoom: 18,
});

const plugin = new GltfPlugin(map);
plugin.addModels([{
    modelId: '03a234cb',
    coordinates: [82.886554, 54.980988],
    modelUrl: 'models/cube_draco.glb',
    rotateX: 90,
    scale: 1000,
    linkedIds: ['141373143530065', '70030076379181421'],
}]);
```

## Release

1. Update the package version by running `npm version patch|minor|major`. This command returns a new package version. Let assume it's 1.2.3
1. Push changes to github and merge them to the «master» branch
1. Go to https://github.com/2gis/mapgl-gltf/releases/new
1. Click the «Choose tag» button and create a new tag according to the version in package.json, for example v1.2.3
1. Make sure the release target is the «master» branch
1. Paste the release tag into the «Release title» field, for example v1.2.3
1. Add a release description
1. Click the «Publish release» button 
1. Go to https://github.com/2gis/mapgl-gltf/actions and wait for completing the release workflow

## Documentation

You can find the more information in the official [documentation](https://docs.2gis.ru/ru/mapgl/examples/gltf-plugin).
