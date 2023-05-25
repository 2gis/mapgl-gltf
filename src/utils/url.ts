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
