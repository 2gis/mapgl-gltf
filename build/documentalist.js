const { Documentalist, TypescriptPlugin } = require('@documentalist/compiler');
const { mkdirSync, writeFileSync } = require('fs');

mkdirSync('dist', {
    recursive: true,
});

const excludePaths = [
    'src/control/',
    'src/external/',
    'src/utils/',
    'src/defaultOptions.ts',
    'src/eventSource.ts',
    'src/loader.ts',
    'src/poiGroups.ts',
    'src/realtyScene.ts',
];

new Documentalist()
    .use(/\.ts$/, new TypescriptPlugin({ excludePaths }))
    .documentGlobs('src/**/*')
    .then((docs) => JSON.stringify(docs))
    .then((json) => writeFileSync('dist/docs.json', json))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
