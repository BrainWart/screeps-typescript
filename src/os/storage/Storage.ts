export class Storage {
    public static base: Storage = new Storage([]);

    private constructor(protected memoryPath: string[]) { }

    public get<X>(path: string[] | string, fallback?: X) : X {
        if (typeof path === "string") {
            return _.get<X>(Memory, [...this.memoryPath, path], fallback);
        } else {
            return _.get<X>(Memory, [...this.memoryPath, ...path], fallback);
        }
    }
}
