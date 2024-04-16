## Release v2

**All changes have to be made on «master» branch.**

1. Update the package version by running `npm version patch|minor`. This command returns a new package version. Let assume it's 2.3.4
1. Push changes to github and merge them to the «master» branch
1. Go to https://github.com/2gis/mapgl-gltf/releases/new
1. Click the «Choose tag» button and create a new tag according to the version in package.json, for example v2.3.4
1. Make sure the release target is the «master» branch
1. Paste the release tag into the «Release title» field, for example v2.3.4
1. Add a release description
1. Click the «Publish release» button
1. Go to https://github.com/2gis/mapgl-gltf/actions and wait for completing the release workflow

## Release v1

**All changes have to be made on «plugin-v1» branch.**

1. Update the package version by running `npm version patch|minor`. This command returns a new package version. Let assume it's 1.2.3
1. Push changes to github and merge them to the «plugin-v1» branch
1. Go to https://github.com/2gis/mapgl-gltf/releases/new
1. Click the «Choose tag» button and create a new tag according to the version in package.json, for example v1.2.3
1. Make sure the release target is the «plugin-v1» branch
1. Paste the release tag into the «Release title» field, for example v1.2.3
1. Add a release description
1. Unset the «Set as the latest release» checkbox because version 1 release can't be the latest
1. Click the «Publish release» button
1. Go to https://github.com/2gis/mapgl-gltf/actions and wait for completing the release workflow