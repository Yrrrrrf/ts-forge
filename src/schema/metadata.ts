// src/schema/metadata.ts
import { BaseClient } from '../client/base';
import { mapPgTypeToTs } from '../tools/type-maps';

/**
 * Column metadata from the API
 */
export interface ApiColumnMetadata {
  name: string;
  type: string;
  nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
  references?: {
    schema: string;
    table: string;
    column: string;
  };
}

/**
 * Table metadata from the API
 */
export interface ApiTableMetadata {
  name: string;
  schema: string;
  columns: ApiColumnMetadata[];
  primary_key?: string[];
  foreign_keys: {
    columns: string[];
    references: {
      schema: string;
      table: string;
      columns: string[];
    };
  }[];
}

/**
 * View metadata from the API
 */
export interface ApiViewMetadata {
  name: string;
  schema: string;
  columns: ApiColumnMetadata[];
  definition: string;
}

/**
 * Function metadata from the API
 */
export interface ApiFunctionMetadata {
  name: string;
  schema: string;
  parameters: {
    name: string;
    type: string;
    mode: 'IN' | 'OUT' | 'INOUT';
    default_value?: string;
  }[];
  return_type: string;
  language: string;
  is_aggregate: boolean;
  description?: string;
}

/**
 * Complete schema metadata
 */
export interface SchemaMetadata {
  name: string;
  tables: Record<string, ApiTableMetadata>;
  views: Record<string, ApiViewMetadata>;
  functions: Record<string, ApiFunctionMetadata>;
}

/**
 * Type mappings for schema elements
 */
export interface GeneratedTypes {
  tables: Record<string, string>;
  views: Record<string, string>;
  functions: Record<string, string>;
  params: Record<string, string>;
}

/**
 * Schema metadata fetcher class
 */
export class SchemaMetadataFetcher {
  constructor(private client: BaseClient) {}

  /**
   * Fetches complete metadata for specified schemas
   */
  async fetchMetadata(schemas?: string[]): Promise<Record<string, SchemaMetadata>> {
    const response = await this.client.get<SchemaMetadata[]>('/dt/schemas', {
      params: schemas ? { schemas: schemas.join(',') } : undefined
    });

    return response.reduce((acc, schema) => {
      acc[schema.name] = schema;
      return acc;
    }, {} as Record<string, SchemaMetadata>);
  }

  /**
   * Generates TypeScript interfaces for all schema elements
   */
  generateTypeDefinitions(metadata: Record<string, SchemaMetadata>): GeneratedTypes {
    const types: GeneratedTypes = {
      tables: {},
      views: {},
      functions: {},
      params: {}
    };

    // Generate types for each schema
    Object.entries(metadata).forEach(([schemaName, schema]) => {
      // Generate table types
      Object.entries(schema.tables).forEach(([tableName, table]) => {
        types.tables[`${schemaName}.${tableName}`] = this.generateTableInterface(table);
      });

      // Generate view types
      Object.entries(schema.views).forEach(([viewName, view]) => {
        types.views[`${schemaName}.${viewName}`] = this.generateViewInterface(view);
      });

    //   // Generate function types
    //   Object.entries(schema.functions).forEach(([funcName, func]) => {
    //     const { params, returnType } = this.generateFunctionTypes(func);
    //     types.functions[`${schemaName}.${funcName}`] = returnType;
    //     types.params[`${schemaName}.${funcName}.params`] = params;
    //   });
    });

    return types;
  }

  /**
   * Generates a TypeScript interface for a table
   */
  private generateTableInterface(table: ApiTableMetadata): string {
    const properties = table.columns.map(column => {
      const tsType = mapPgTypeToTs(column.type);
      const nullable = column.nullable ? '?' : '';
      return `    ${column.name}${nullable}: ${tsType};`;
    });

    return `interface ${table.name} {\n${properties.join('\n')}\n}`;
  }

  /**
   * Generates a TypeScript interface for a view
   */
  private generateViewInterface(view: ApiViewMetadata): string {
    const properties = view.columns.map(column => {
      const tsType = mapPgTypeToTs(column.type);
      const nullable = column.nullable ? '?' : '';
      return `  ${column.name}${nullable}: ${tsType};`;
    });

    return `interface ${view.name} {\n${properties.join('\n')}\n}`;
  }

  /**
   * Writes type definitions to a file
   */
  async writeTypesToFile(types: GeneratedTypes, filePath: string): Promise<void> {
    const content = this.formatTypeDefinitions(types);
    
    // Use node's fs module if available, otherwise use browser API
    if (typeof window === 'undefined') {
      const fs = await import('fs/promises');
      await fs.writeFile(filePath, content, 'utf8');
    } else {
      const blob = new Blob([content], { type: 'text/typescript' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filePath;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Formats type definitions into a string
   */
  private formatTypeDefinitions(types: GeneratedTypes): string {
    let content = '// Generated by ts-forge\n\n';

    // Add tables
    content += '// Table Interfaces\n';
    Object.values(types.tables).forEach(tableType => {
      content += `${tableType}\n\n`;
    });

    // Add views
    content += '// View Interfaces\n';
    Object.values(types.views).forEach(viewType => {
      content += `${viewType}\n\n`;
    });

    // Add functions
    content += '// Function Types\n';
    Object.entries(types.functions).forEach(([funcName, returnType]) => {
      const paramType = types.params[`${funcName}.params`];
      content += `${paramType}\n`;
      content += `type ${funcName.split('.')[1]}Return = ${returnType};\n\n`;
    });

    return content;
  }
}

// Export a factory function
export function createSchemaMetadataFetcher(client: BaseClient): SchemaMetadataFetcher {
  return new SchemaMetadataFetcher(client);
}