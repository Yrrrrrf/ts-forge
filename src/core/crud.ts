// /**
//  * @file crudOperations.ts
//  * @description Provides functionality to generate CRUD operations for database tables.
//  */

// import { defaultApiClient } from './client';
// import type { SchemaTypes } from './schema-generator';

// /**
//  * Represents a set of CRUD (Create, Read, Update, Delete) operations for a specific table.
//  * @template T The type of the entity that these operations work with.
//  */
// type CrudOperations<T> = {
//     /** Retrieves all records from the table, optionally filtered by query parameters. */
//     getAll: (params?: Record<string, string>) => Promise<T[]>;
//     /** Retrieves a single record by its ID. */
//     getOne: (id: string | number) => Promise<T>;
//     /** Creates a new record in the table. */
//     create: (data: Partial<T>) => Promise<T>;
//     /** Updates an existing record identified by its ID. */
//     update: (id: string | number, data: Partial<T>) => Promise<T>;
//     /** Deletes a record from the table by its ID. */
//     delete: (id: string | number) => Promise<void>;
// };

// /**
//  * Generates a set of CRUD operations for a specific table in a schema.
//  * @template T The type of the entity that these operations will work with.
//  * @param {string} schema The name of the schema containing the table.
//  * @param {string} table The name of the table.
//  * @returns {CrudOperations<T>} An object containing CRUD operations for the specified table.
//  */
// export function generateCrudOperations<T>(schema: string, table: string): CrudOperations<T> {
//     const basePath = `/${schema}/${table}`;

//     return {
//         getAll: (params = {}) => defaultApiClient.request<T[]>(basePath, { params }),
//         getOne: (id) => defaultApiClient.request<T>(`${basePath}/${id}`),
//         create: (data) => defaultApiClient.request<T>(basePath, { method: 'POST', body: JSON.stringify(data) }),
//         update: (id, data) => defaultApiClient.request<T>(`${basePath}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
//         delete: (id) => defaultApiClient.request(`${basePath}/${id}`, { method: 'DELETE' }),
//     };
// }

// /**
//  * Generates an API object containing CRUD operations for all tables in all schemas.
//  * @param {SchemaTypes} schemaTypes An object representing the structure of the database schemas and tables.
//  * @returns {Record<string, Record<string, CrudOperations<any>>>} An object where keys are schema names,
//  *          containing nested objects where keys are table names, containing CRUD operations for each table.
//  *
//  * @example
//  * const api = generateApiForSchema(schemaTypes);
//  * // Use the generated API:
//  * const students = await api.academic.students.getAll();
//  */
// export function generateApiForSchema(schemaTypes: SchemaTypes) {
//     const api: Record<string, Record<string, CrudOperations<any>>> = {};

//     for (const [schema, tables] of Object.entries(schemaTypes)) {
//         api[schema] = {};
//         for (const table of Object.keys(tables)) {
//             api[schema][table] = generateCrudOperations(schema, table);
//         }
//     }

//     return api;
// }
