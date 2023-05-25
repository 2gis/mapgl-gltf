export type Parameter<T extends (...args: any) => any> = Parameters<T>['0'];
