// // src/lib/api/client.ts
// import { get } from 'svelte/store';
// import { API_CONFIG } from '$lib/stores/app';

// /**
//  * Represents the structure of API request options.
//  * Extends the standard RequestInit interface with additional options.
//  */
// interface ApiRequestOptions extends RequestInit {
//     /** Additional query parameters to be appended to the URL */
//     params?: Record<string, string>;
// }

// /**
//  * API Client class for handling all API requests.
//  * Provides methods for common CRUD operations and custom endpoints.
//  */
// export class ApiClient {
//     /** The base URL for all API requests */
//     private baseUrl: string;

//     /**
//      * Creates an instance of ApiClient.
//      * @param baseUrl - The base URL for all API requests.
//      */
//     constructor(baseUrl: string) {
//         this.baseUrl = baseUrl;
//     }
    
//     /**
//      * Builds a URL with query parameters.
//      * @param endpoint - The API endpoint.
//      * @param params - An object containing query parameters.
//      * @returns The complete URL with query parameters.
//      * @private
//      */
//     private buildUrl(endpoint: string, params?: Record<string, string>): string {
//         const url = new URL(`${this.baseUrl}${endpoint}`);
//         if (params) {
//             Object.entries(params).forEach(([key, value]) => {
//                 if (value !== undefined && value !== null && value !== '') {
//                     url.searchParams.append(key, value);
//                 }
//             });
//         }
//         return url.toString();
//     }

//     /**
//      * Updates the base URL of the API client.
//      * @param newBaseUrl - The new base URL to use for API requests.
//      */
//     updateBaseUrl(newBaseUrl: string) {
//         this.baseUrl = newBaseUrl;
//     }

//     /**
//      * Makes an API request.
//      * @param endpoint - The API endpoint.
//      * @param options - Request options including method, body, and params.
//      * @returns A promise that resolves with the response data.
//      * @throws Will throw an error if the request fails.
//      * @private
//      */
//     async request<T>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
//         const {params, ...fetchOptions} = options;
//         const url = this.buildUrl(endpoint, params);

//         console.log('Request URL:', url);

//         try {
//             const response = await fetch(url, {
//                 ...fetchOptions,
//                 headers: {
//                     'Content-Type': 'application/json',
//                     ...fetchOptions.headers,
//                 },
//             });

//             if (!response.ok) {
//                 throw new Error(`HTTP error! status: ${response.status}`);
//             }

//             return await response.json();
//         } catch (error) {
//             console.error('API request error:', error);
//             throw error;
//         }
//     }

//     /**
//      * Fetches rows from a table or view.
//      * @param name - The name of the table or view.
//      * @param params - Query parameters for filtering.
//      * @param isView - Whether the target is a view (default: false).
//      * @returns A promise that resolves with the fetched data.
//      */
//     async fetchRows<T>(name: string, params: Record<string, string> = {}, isView: boolean = false): Promise<T[]> {
//         const urlPath = isView ? `view/${name}` : name;
//         const endpoint = `/${urlPath.replace(/ /g, '_').toLowerCase()}`;
//         return this.request<T[]>(endpoint, {params});
//     }

//     /**
//      * Fetches all tables.
//      * @returns A promise that resolves with an array of table names.
//      */
//     async fetchTables(): Promise<string[]> {
//         return this.request<string[]>('/tables');
//     }

//     /**
//      * Fetches all views.
//      * @returns A promise that resolves with an array of view names.
//      */
//     async fetchViews(): Promise<string[]> {
//         return this.request<string[]>('/views');
//     }

//     /**
//      * Fetches columns for a table.
//      * @param table - The name of the table.
//      * @returns A promise that resolves with an array of column names.
//      */
//     async fetchColumns(table: string): Promise<string[]> {
//         return this.request<string[]>(`/${table.replace(/ /g, '_').toLowerCase()}/columns`);
//     }

//     /**
//      * Creates a new record in a table.
//      * @param tableName - The name of the table.
//      * @param data - The data to create the new record.
//      * @returns A promise that resolves with the created record data.
//      */
//     async createRecord<T>(tableName: string, data: Record<string, any>): Promise<T> {
//         const endpoint = `/${tableName.replace(/ /g, '_').toLowerCase()}`;
//         return this.request<T>(endpoint, {
//             method: 'POST',
//             body: JSON.stringify(data),
//         });
//     }

//     /**
//      * Deletes a record from a table.
//      * @param tableName - The name of the table.
//      * @param field - The field to use for identifying the record (usually 'id').
//      * @param value - The value of the field to identify the record to delete.
//      * @returns A promise that resolves when the delete operation is complete.
//      */
//     async deleteRecord(tableName: string, field: string, value: string | number): Promise<void> {
//         const endpoint = `/${tableName.replace(/ /g, '_').toLowerCase()}`;
//         await this.request(endpoint, {
//             method: 'DELETE',
//             params: {[field]: value.toString()},
//         });
//     }

//     /**
//      * Updates an existing record in a table.
//      * @param tableName - The name of the table.
//      * @param field - The field to use for identifying the record (usually 'id').
//      * @param value - The value of the field to identify the record to update.
//      * @param data - The updated data for the record.
//      * @returns A promise that resolves with the updated record data.
//      */
//     async updateRecord<T>(tableName: string, field: string, value: string | number, data: Record<string, any>): Promise<T> {
//         const endpoint = `/${tableName.replace(/ /g, '_').toLowerCase()}`;
//         return this.request<T>(endpoint, {
//             method: 'PUT',
//             params: {[field]: value.toString()},
//             body: JSON.stringify(data),
//         });
//     }

// }

// /**
//  * Creates a default instance of the ApiClient using the API URL from the store.
//  * @returns An instance of ApiClient
//  */
// function createDefaultApiClient(): ApiClient {
//     return new ApiClient(get(API_CONFIG).API_URL);
// }

// /**
//  * Default instance of the ApiClient.
//  * Uses the base URL from the api_url store.
//  */
// export const defaultApiClient = createDefaultApiClient();

// // Export the default client as the default export
// export default defaultApiClient;