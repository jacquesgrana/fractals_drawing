export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export type CustomDate = {
    date: string;
    timezone: string;
    timezone_type: number;
};