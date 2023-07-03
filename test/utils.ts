/**
 * @param ms
 * Pause script exec of milliseconds
 * */
export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
