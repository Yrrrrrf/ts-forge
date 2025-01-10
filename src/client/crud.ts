// src/client/crud.ts
import { BaseClient, BaseRequestOptions, TsForgeError } from './base';
import { TableMetadata } from './types';

/**
 * Interface for filtering operations
 */
export interface FilterOptions {
  where?: Record<string, unknown>;
  orderBy?: Record<string, 'asc' | 'desc'>;
  limit?: number;
  offset?: number;
}


/**
 * Standard CRUD operations interface
 */
export interface CrudOperations<T> {
  findOne(id: string | number): Promise<T>;
  findAll(filter?: FilterOptions): Promise<T[]>;
  create(data: Partial<T>): Promise<T>;
  update(id: string | number, data: Partial<T>): Promise<T>;
  delete(id: string | number): Promise<void>;
  findMany(filter: FilterOptions): Promise<T[]>;
  count(filter?: FilterOptions): Promise<number>;
}

/**
 * Creates CRUD operations for a specific table
 */
export function createCrudOperations<T>(
  client: BaseClient,
  table: TableMetadata
): CrudOperations<T> {
  const basePath = `/${table.schema}/${table}`;

  /**
   * Transforms filter options into query parameters
   */
  function transformFilterToParams(filter: FilterOptions = {}): Record<string, string> {
    const params: Record<string, string> = {};

    if (filter.where) {
      params['where'] = JSON.stringify(filter.where);
    }
    if (filter.orderBy) {
      params['order_by'] = JSON.stringify(filter.orderBy);
    }
    if (filter.limit) {
      params['limit'] = filter.limit.toString();
    }
    if (filter.offset) {
      params['offset'] = filter.offset.toString();
    }

    return params;
  }

  return {
    /**
     * Retrieve all records
     */
    async findAll(filter?: FilterOptions): Promise<T[]> {
      const params = transformFilterToParams(filter);
      return client.get<T[]>(basePath, { params });
    },

    /**
     * Retrieve a single record by ID
     */
    async findOne(id: string | number): Promise<T> {
      const response = await client.get<T>(`${basePath}?id=${id}`);
      if (!response) {
        throw new TsForgeError(
          `No record found with id ${id}`,
          'NOT_FOUND',
          404
        );
      }
      return response;
    },

    /**
     * Create a new record
     */
    async create(data: Partial<T>): Promise<T> {
      return client.post<T>(basePath, data);
    },

    /**
     * Update an existing record
     */
    async update(id: string | number, data: Partial<T>): Promise<T> {
      return client.put<T>(`${basePath}?id=${id}`, data);
    },

    /**
     * Delete a record
     */
    async delete(id: string | number): Promise<void> {
      await client.delete(`${basePath}?id=${id}`);
    },

    /**
     * Find multiple records with filtering
     */
    async findMany(filter: FilterOptions): Promise<T[]> {
      const params = transformFilterToParams(filter);
      return client.get<T[]>(basePath, { params });
    },

    /**
     * Count records with optional filtering
     */
    async count(filter?: FilterOptions): Promise<number> {
      const params = transformFilterToParams(filter);
      params['count'] = 'true';
      const response = await client.get<{ count: number }>(`${basePath}/count`, { params });
      return response.count;
    },
  };
}
