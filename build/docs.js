const { generateDocs } = require('@2gis/js-docs-generator');
const { mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');

const version = process.env.VERSION || 'branch';
mkdirSync(join('dist', 'docs', version), { recursive: true });

const excludePaths = [
    'src/control/',
    'src/external/',
    'src/realtyScene/',
    'src/utils/',
    'src/defaultOptions.ts',
    'src/eventSource.ts',
    'src/loader.ts',
    'src/poiGroups.ts',
];

generateDocs({
    version,
    defaultReference: 'GltfPlugin',
    docsHost: 'https://unpkg.com/@2gis/mapgl-gltf@^2/dist/docs',
    excludePaths,
    globs: ['src/**/*'],
    ignoreMarkdown: true,
    legacyOutPath: 'dist/docs.json',
})
    .then((result) => {
        writeFileSync(join('dist', 'docs', 'manifest.json'), result.manifest);
        writeFileSync(join('dist', 'docs', version, 'en.json'), result.reference.en);
        writeFileSync(join('dist', 'docs', version, 'ru.json'), result.reference.ru);
    })
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
