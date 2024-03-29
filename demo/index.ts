import { load } from '@2gis/mapgl';

import { GltfPlugin } from '../src/index';
import { REALTY_SCENE, REALTY_SCENE_1 } from './mocks';

let isDarkTheme = false;

async function start() {
    const mapglAPI = await load();

    const map = new mapglAPI.Map('container', {
        center: [47.245286302641034, 56.134743473834099],
        zoom: 17.9,
        key: 'cb20c5bf-34d3-4f0e-9b2b-33e9b8edb57f',
        pitch: 45,
        rotation: 330,
        enableTrackResize: true,
    });

    (window as any).map = map;

    const plugin = new GltfPlugin(map, {
        modelsLoadStrategy: 'dontWaitAll',
        modelsBaseUrl: 'https://disk.2gis.com/digital-twin/models_s3/realty_ads/zgktechnology/',
        dracoScriptsUrl: 'libs/draco/',
        floorsControl: { position: 'centerRight' },
        poiConfig: {
            primary: {
                fontSize: 14,
            },
            secondary: {
                fontSize: 14,
            },
        },
        hoverHighlight: {
            intencity: 0.1,
        },
        groundCoveringColor: 'rgba(233, 232, 220, 0.8)',
    });

    (window as any).gltfPlugin = plugin;
    (window as any).realtyScene = REALTY_SCENE;

    new mapglAPI.Control(map, '<button>Add Scene</button>', {
        position: 'topLeft',
    })
        .getContainer()
        .addEventListener('click', () => {
            plugin.removeRealtyScene();
            plugin.addRealtyScene(REALTY_SCENE, { modelId: '03a234cb', floorId: '235034' });
        });

    new mapglAPI.Control(map, '<button>Remove Scene</button>', {
        position: 'topLeft',
    })
        .getContainer()
        .addEventListener('click', () => {
            plugin.removeRealtyScene();
        });

    new mapglAPI.Control(map, '<button>Add Scene 1</button>', {
        position: 'topLeft',
    })
        .getContainer()
        .addEventListener('click', () => {
            plugin.removeRealtyScene();
            plugin.addRealtyScene(REALTY_SCENE_1, { modelId: 'ds321ba234cb' });
        });

    new mapglAPI.Control(map, '<button>Remove Scene 1</button>', {
        position: 'topLeft',
    })
        .getContainer()
        .addEventListener('click', () => {
            plugin.removeRealtyScene();
        });

    new mapglAPI.Control(map, '<button>Add Model</button>', {
        position: 'topLeft',
    })
        .getContainer()
        .addEventListener('click', () => {
            plugin.addModel(REALTY_SCENE[0]);
        });

    new mapglAPI.Control(map, '<button>Remove Model</button>', {
        position: 'topLeft',
    })
        .getContainer()
        .addEventListener('click', () => {
            plugin.removeModel(REALTY_SCENE[0].modelId);
        });

    new mapglAPI.Control(map, '<button>Add Models</button>', {
        position: 'topLeft',
    })
        .getContainer()
        .addEventListener('click', () => {
            plugin.addModels(REALTY_SCENE.slice(1));
        });

    new mapglAPI.Control(map, '<button>Remove Models</button>', {
        position: 'topLeft',
    })
        .getContainer()
        .addEventListener('click', () => {
            plugin.removeModels(REALTY_SCENE.slice(1).map((m) => m.modelId));
        });

    new mapglAPI.Control(map, '<button style="margin-top: 8px">Toggle Theme</button>', {
        position: 'topLeft',
    })
        .getContainer()
        .addEventListener('click', () => {
            map.setStyleById(
                isDarkTheme
                    ? 'c080bb6a-8134-4993-93a1-5b4d8c36a59b'
                    : 'e05ac437-fcc2-4845-ad74-b1de9ce07555',
            );
            isDarkTheme = !isDarkTheme;
        });

    (['click'] as const).forEach((eventName) => {
        plugin.on(eventName, (e) => {
            console.log(e);
        });
    });

    const statsTable = document.getElementById('stats');

    const printStats = () => {
        if (!statsTable) {
            return;
        }
        statsTable.innerHTML = `<pre>${JSON.stringify(
            plugin.getModelRendererInfo(),
            null,
            2,
        )}</pre>`;

        requestAnimationFrame(printStats);
    };
    requestAnimationFrame(printStats);
}

start();
