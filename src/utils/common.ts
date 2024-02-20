export function clamp(value: number, min: number, max: number): number {
    value = Math.max(value, min);
    value = Math.min(value, max);
    return value;
}

export function clone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

export function createCompoundId(modelId: string | number, floorId?: string | number) {
    if (floorId === undefined) {
        return String(modelId);
    }
    return `${modelId}_${floorId}`;
}

export type RequiredExcept<T, K extends keyof T> = T & Required<Omit<T, K>>;

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
