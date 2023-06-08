declare module '*.svg' {
    const _: any;
    export default _;
}

declare module '*.css' {
    const classes: { [key: string]: string };
    export default classes;
}
