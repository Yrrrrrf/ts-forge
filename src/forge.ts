// src/forge.ts
import { cyan, dim, log } from './tools/logging';
import { BaseClient } from './client/base';
import { removeDir, ensureDir, writeFiles } from './tools/fs-ops';

import { 
  generateTypes, 
  SchemaMetadata,
  TableMetadata
} from './client/types';

/**
 * Schema lookup type for easy access to tables
 */
type SchemaLookup = Record<string, Record<string, TableMetadata>>;

/**
 * Main class for handling API requests and type generation
 */
export class TsForge {
  baseClient: BaseClient;
  schemaMetadata: SchemaMetadata[] = [];
  private schemaLookup: SchemaLookup = {};

  constructor(baseClient: BaseClient) {
    this.baseClient = baseClient;
	this.init();
  }

  /**
   * Get table metadata by schema and table name
   */
  getTable(schemaName: string, tableName: string): TableMetadata | undefined {
    const schema = this.schemaLookup[schemaName];
    if (!schema || !schema[tableName]) {
      return undefined;
    }
    
    return {
      ...schema[tableName],
      name: tableName,
      schema: schemaName  // Explicitly set the schema name
    };
  }

  /**
   * Get all tables for a schema
   */
  getSchemaData(schemaName: string): Record<string, TableMetadata> | undefined {
    return this.schemaLookup[schemaName];
  }

  /**
   * Initialize forge and build lookup tables
   */
  async init(): Promise<void> {
    this.schemaMetadata = await this.baseClient.get<SchemaMetadata[]>('/dt/schemas');
    
    // Build lookup table for easy access
    this.schemaLookup = this.schemaMetadata.reduce((acc, schema) => {
      acc[schema.name] = schema.tables;
      return acc;
    }, {} as SchemaLookup);

    log.info(dim('Loaded schema metadata: ') + cyan(this.schemaMetadata.map(s => s.name).join(', ')));
  }

  async genSchemaTypes(schemas: string[]): Promise<void> {
      await removeDir('src/gen');
      await ensureDir('src/gen');
      await generateTypes(this.schemaMetadata.filter(s => schemas.includes(s.name)));
      log.info(dim('Generated types for schemas: ') + cyan(schemas.join(', ')));
      log.info(dim('Generated index file for schemas: ') + cyan('src/gen/index.ts'));
      
      await writeFiles([{
          path: 'src/gen/metadata.json',
          content: JSON.stringify(this.schemaMetadata)
      }]);
  }
}