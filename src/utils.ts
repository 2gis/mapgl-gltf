/**
 * World size in map points
 */
const worldSize = 2 ** 32;

/**
 * Spheroid radius
 * https://epsg.io/3857
 */
export const MERCATOR_EARTH_RADIUS = 6378137;

/**
 * Size of equator
 */
export const EARTH_CIRCUMFERENCE = 2 * Math.PI * MERCATOR_EARTH_RADIUS;

/**
 * How many map points in one meter of web mercator
 */
export const MAP_POINTS_IN_METER = worldSize / EARTH_CIRCUMFERENCE;

export function clamp(value: number, min: number, max: number): number {
    value = Math.max(value, min);
    value = Math.min(value, max);
    return value;
}

export function degToRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
}

/**
 * Projects point in geographical coordinates to point in map coordinates.
 * https://github.com/Trufi/utils/blob/main/src/mapPoint/fromLngLat.ts
 */
export function mapPointFromLngLat(lngLat: number[]): number[] {
    const sin = Math.sin(degToRad(lngLat[1]));

    const x = (lngLat[0] * worldSize) / 360;
    const y = (Math.log((1 + sin) / (1 - sin)) * worldSize) / (4 * Math.PI);

    const worldHalf = worldSize / 2;
    return [clamp(x, -worldHalf, worldHalf), clamp(y, -worldHalf, worldHalf)];
}

function projectionScaleFactor(latitude: number): number {
    return 1 / Math.cos(degToRad(latitude));
}

/**
 * Translation of the distance from meters to map points
 */
export function geoToMapDistance(point: number[], distance: number): number {
    return distance * MAP_POINTS_IN_METER * projectionScaleFactor(point[1]);
}

export function concatUrl(baseUrl: string, path: string) {
    if (baseUrl.length === 0) {
        return path;
    }

    if (baseUrl[baseUrl.length - 1] === '/') {
        return baseUrl + path;
    }

    return baseUrl + '/' + path;
}

/**
 * Checks whether passed url is absolute, i.e. it begins
 * with http://, https:// or //
 *
 * @param url - checked url
 */
export function isAbsoluteUrl(url: string): boolean {
    return /^https?:\/\//i.test(url);
}
