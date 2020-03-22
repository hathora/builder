export class NullableValue<T> {
    public static isNotNullish<T>(value: T | null | undefined): value is T {
        return value != null;
    }

    public static isNullish<T>(value: T | null | undefined): value is null | undefined {
        return value == null;
    }

    public static of<T>(value: T | null | undefined): NullableValue<T> {
        if (value == null) {
            return value === null ? NullableValue.NULL_VALUE : NullableValue.UNDEFINED_VALUE;
        }
        return new NullableValue<T>(value);
    }

    private static NULL_VALUE = new NullableValue<any>(null);
    private static UNDEFINED_VALUE = new NullableValue<any>(undefined);

    private value: T | null | undefined;

    private constructor(value: T | null | undefined) {
        this.value = value;
    }

    public map<V>(mapper: (value: T) => V): NullableValue<V> {
        return NullableValue.of<V>(NullableValue.isNullish(this.value) ? this.value : mapper(this.value));
    }

    public flatMap<V>(mapper: (value: T) => NullableValue<V>): NullableValue<V> {
        return NullableValue.isNullish(this.value) ? NullableValue.of<V>(this.value) : mapper(this.value);
    }

    public get(): T | null | undefined {
        return this.value;
    }

    public getOrDefault(defaultValue: T): T {
        return this.value == null ? defaultValue : this.value;
    }

    public getOrNull(): T | null {
        return this.value == null ? null : this.value;
    }

    public getOrUndefined(): T | undefined {
        return this.value == null ? undefined : this.value;
    }

    public getOrThrow(error: Error): T {
        if (this.value == null) {
            throw error;
        }
        return this.value;
    }
}
