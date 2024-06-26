type RequiredOptional<T extends object> = Exclude<
    {
        [K in keyof T]: T extends Record<K, T[K]> ? never : K;
    }[keyof T],
    undefined
>;

export type DefaultOptionalOptions<T extends object> = Required<Pick<T, RequiredOptional<T>>>;

export function applyOptionalDefaults<T extends object>(
    params: T,
    defaults: DefaultOptionalOptions<T>,
): Required<T> {
    const result = { ...params };
    for (const keyString in defaults) {
        const key = keyString as keyof DefaultOptionalOptions<T>;
        if (result[key] === undefined) {
            result[key] = defaults[key];
        }
    }
    // мы точно уверенны что вернем Required<T>
    return result as Required<T>;
}
