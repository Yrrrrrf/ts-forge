// src/types/index.ts

/**
 * Base type for schema objects ensuring string keys
 */
export interface SchemaTypes {
    [key: string]: any;
}

/**
 * Type helper for accessing schema types
 */
export type TypesOf<T extends SchemaTypes> = {
    [K in keyof T]: T[K];
};

/**
 * Schema registry type definition
 */
export interface SchemaRegistry<T extends SchemaTypes = SchemaTypes> {
    getTypes(): TypesOf<T>;
    getSchemaNames(): string[];
    hasSchema(name: string): boolean;
    getSchemaType<K extends keyof T>(name: K): T[K];
}

/**
 * Create a type-safe schema context
 */
export function createSchemaContext<T extends SchemaTypes>(types: T): SchemaRegistry<T> {
    return {
        getTypes: () => types,
        getSchemaNames: () => Object.keys(types),
        hasSchema: (name: string): boolean => name in types,
        getSchemaType: <K extends keyof T>(name: K) => types[name]
    };
}

/**
 * Type helper for schema names
 */
export type SchemaName<T extends SchemaTypes> = keyof T & string;

/**
 * Type helper for getting a specific schema type
 */
export type SchemaType<T extends SchemaTypes, K extends keyof T> = T[K];
