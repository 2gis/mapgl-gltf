const suite = process.env.TEST_SUITE || 'unit';

const suiteParams = {
    unit: {
        testEnvironment: 'node',
        testMatch: ['**/test/unit/**/*.ts'],
    },
    integration: {
        globalSetup: './test/global-setup.js',
        globalTeardown: './test/global-teardown.js',
        setupFiles: ['./test/setEnvVars.ts'],
        reporters: ['default'],
        testEnvironment: 'node',
        testMatch: ['**/test/integration/**/*.ts'],
    },
    screenshots: {
        globalSetup: './test/global-setup.js',
        globalTeardown: './test/global-teardown.js',
        setupFiles: ['./test/setEnvVars.ts'],
        maxWorkers: 5,
        maxConcurrency: 3,
        testTimeout: 15000,
        testEnvironment: 'node',
        testMatch: ['**/test/screenshots/**/*screen.ts'],
    },
};

module.exports = {
    preset: 'ts-jest',
    globals: {
        'ts-jest': {
            diagnostics: {
                // Игнорируем воргинги про esModuleInterop, которые нам чинить, кажется не требуется
                // потому что в тестах импорты работают без проблем.
                ignoreCodes: [151001],
            },
        },
    },
    ...suiteParams[suite],
};
