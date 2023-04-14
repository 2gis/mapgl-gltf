import { ThreeJsPlugin, THREE } from './plugin';

if (typeof window !== 'undefined') {
    if ('mapgl' in window) {
        mapgl.ThreeJsPlugin = ThreeJsPlugin;
    } else {
        // Если так вышло, что плагин инициализирован раньше
        // mapgl, поместим его во временную переменную
        // Из нее уже сам mapgl все положит в себя.
        if (!window.__mapglPlugins) {
            window.__mapglPlugins = {};
        }

        window.__mapglPlugins.ThreeJsPlugin = ThreeJsPlugin;
    }
}

export { ThreeJsPlugin, THREE };
