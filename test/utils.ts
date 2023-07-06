/**
 * @param ms
 * Pause script exec of milliseconds
 * */
export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * Models and poi's for create objects at the scene
 * */
export const OBJECTS_FOR_TESTS = {
    models: {
        cubeBig: {
            modelId: 1,
            coordinates: [82.886554, 54.98085],
            modelUrl: 'models/cube_draco.glb',
            rotateX: 90,
            scale: 500,
        },
        cubeSmall: {
            modelId: 2,
            coordinates: [82.886454, 54.980588],
            modelUrl: 'models/cube_draco.glb',
            rotateX: 90,
            rotateY: 31,
            scale: 250,
        },
    },
    poi: {
        asciiLetters: {
            id: 1,
            type: 'primary',
            minZoom: 12,
            elevation: 40,
            fontSize: 10,
            fontColor: '#aa3a3a',
            data: [
                {
                    coordinates: [82.886454, 54.98075],
                    elevation: 30,
                    label: '@<>?|!@#$%\n^&*()_+-=\n3к\n78.4 м²',
                    userData: {
                        url: 'https://example.com/',
                    },
                },
            ],
        },
        engRusLetters: {
            id: 2,
            type: 'secondary',
            minZoom: 12,
            elevation: 20,
            fontSize: 10,
            fontColor: '#3a3a3a',
            data: [
                {
                    coordinates: [82.886104, 54.98075],
                    elevation: 30,
                    label: 'qwe RTY пои ГРУП',
                    userData: {
                        url: 'https://example.com/',
                    },
                },
            ],
        },
    },
};
