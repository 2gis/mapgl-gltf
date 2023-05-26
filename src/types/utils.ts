export type Parameter<
    T extends (...args: any) => any,
    U extends '0' | '1' | '2',
> = Parameters<T>[U];
