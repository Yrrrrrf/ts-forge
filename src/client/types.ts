// src/schema/gen-types.ts
import { mapPgTypeToTs } from '../tools/type-maps';


// * STATUS TYPES
/**
* Cache status for metadata generation
*/
export interface CacheStatus {
  last_updated: string;
  total_items: number;
  tables_cached: number;
  views_cached: number;
  enums_cached: number;
  functions_cached: number;
  procedures_cached: number;
  triggers_cached: number;
}
  
/**
* Health status response
*/
export interface HealthStatus {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
  // database: boolean;
  // environment: string;
}


// * Tables

/**
 * References to other columns (for foreign keys)
 */
export interface ColumnRef {
  schema: string;
  table: string;
  column: string;
}

/**
* Column metadata matching API Forge response
*/
export interface ColumnMetadata {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isEnum: boolean;
  references?: ColumnRef;
}

/**
* Table metadata matching API Forge response
*/
export interface TableMetadata {
  name: string;
  schema: string;
  columns: ColumnMetadata[];
}

// * VIEWS
export interface ViewColumnMetadata {
  name: string;
  type: string;
  nullable: boolean;
}

export interface ViewMetadata {
  name: string;
  schema: string;
  view_columns: ViewColumnMetadata[];
}

// * Enums
export interface SimpleEnumInfo {
  name: string;
  values: string[];

}

// * Functions


export interface FunctionParameterMetadata {
  name: string;
  type: string;
  mode: string;
  has_default: boolean;
  default_value: string | null;
}

export interface ReturnColumnMetadata {
  name: string;
  type: string;
}

export interface FunctionMetadataResponse {
  name: string;
  schema: string;
  object_type: string;
  type: string;
  description: string | null;
  parameters: FunctionParameterMetadata[];
  return_type: string | null;
  return_columns: ReturnColumnMetadata[] | null;
  is_strict: boolean;
}

// * SCHEMA METADATA

/**
* Schema metadata matching API Forge response
*/
export interface SchemaMetadata {
    name: string;
    tables: Record<string, TableMetadata>;
    views: Record<string, ViewMetadata>;
    enums: Record<string, SimpleEnumInfo>;
    functions: Record<string, FunctionMetadataResponse>;
    procedures: Record<string, FunctionMetadataResponse>;
    triggers: Record<string, FunctionMetadataResponse>;
}

// * TYPE GENERATOR ...

// src/generators/types.ts
export class TypeGenerator {
  private indent = '  ';

  /**
   * Generate TypeScript interface for a table
   */
  generateTableInterface(table: TableMetadata): string {
    const lines = [
      `export interface ${this.getInterfaceName(table.name)} {`
    ];

    // Generate properties for each column
    for (const column of table.columns) {
      lines.push(this.generateColumnProperty(column));
    }

    lines.push('}');
    return lines.join('\n');
  }

  /**
   * Generate TypeScript type for a column
   */
  private generateColumnProperty(column: ColumnMetadata): string {
    const typeStr = mapPgTypeToTs(column.type);
    const optional = column.nullable ? '?' : '';
    return `${this.indent}${column.name}${optional}: ${typeStr};`;
  }

  /**
   * Generate query params interface for a table
   */
  generateQueryInterface(table: TableMetadata): string {
    const name = this.getInterfaceName(table.name);
    const lines = [
      `export interface ${name}QueryParams {`
    ];

    // All query params are optional
    for (const column of table.columns) {
      lines.push(`${this.indent}${column.name}?: ${mapPgTypeToTs(column.type)};`);
    }

    lines.push('}');
    return lines.join('\n');
  }

  private getInterfaceName(tableName: string): string {
    return this.toPascalCase(tableName);
  }

  private toPascalCase(str: string): string {
    return str
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }
}