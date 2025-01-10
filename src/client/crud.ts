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

export function createCrudOperations<T>(
  client: BaseClient,
  tableMetadata: TableMetadata
): CrudOperations<T> {
  // Ensure we have all required table information
  if (!tableMetadata || !tableMetadata.name) {
    throw new TsForgeError('Invalid table metadata', 'INVALID_TABLE_METADATA');
  }

  // Construct base path using schema and table name from metadata
  const basePath = `/${tableMetadata.schema}/${tableMetadata.name}`;

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
    async findAll(filter?: FilterOptions): Promise<T[]> {
      return client.get<T[]>(basePath, { params: transformFilterToParams(filter) });
    },

    async findOne(id: string | number): Promise<T> {
      const results = await this.findAll({ where: { id: id.toString() } });
      if (results.length === 0) {
        throw new Error(`No record found with ID: ${id}`);
      }
      return results[0];
    },
    
    async create(data: Partial<T>): Promise<T> {
      return client.post<T>(basePath, data);
    },

    async update(id: string | number, data: Partial<T>): Promise<T> {
      return client.put<T>(basePath, data, { params: { id: id.toString() } });
    },

    async delete(id: string | number): Promise<void> {
      return client.delete(basePath, { params: { id: id.toString() } });
    },

    async findMany(filter: FilterOptions): Promise<T[]> {
      return client.get<T[]>(basePath, { params: transformFilterToParams(filter) });
    },

    async count(filter?: FilterOptions): Promise<number> {
      const params = { ...transformFilterToParams(filter), count: 'true' };
      const response = await client.get<{ count: number }>(`${basePath}/count`, { params });
      return response.count;
    }
  };
}
