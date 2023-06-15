const { setup: setupDevServer } = require('jest-dev-server');

module.exports = async function globalSetup() {
    await setupDevServer({
        command: `http-server -p 8080 ./dist`,
        launchTimeout: 50000,
        port: 8080,
    });
};
