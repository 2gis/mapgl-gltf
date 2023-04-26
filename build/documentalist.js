const { Documentalist, TypescriptPlugin } = require('@documentalist/compiler');
const { mkdirSync, writeFileSync } = require('fs');

mkdirSync('dist', {
    recursive: true,
});

new Documentalist()
    .use(/\.ts$/, new TypescriptPlugin({ excludePaths: ['src/utils.ts'] }))
    .documentGlobs('src/**/*')
    .then((docs) => JSON.stringify(docs))
    .then((json) => writeFileSync('dist/docs.json', json))
    .catch((e) => {
        console.log(e);
        process.exit(1);
    });
