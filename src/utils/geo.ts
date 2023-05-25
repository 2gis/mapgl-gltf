import { clamp, degToRad } from './common';

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
