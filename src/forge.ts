// src/forge.ts
import { cyan, dim, log } from './tools/logging';
import { BaseClient } from './client/base';
import { removeDir, ensureDir, writeFiles } from './tools/fs-ops';
import { MetadataClient } from './client/metadata';

import { 
	HealthStatus,
	CacheStatus,
	// generateTypes, 
	TableMetadata,
	ViewMetadata,
	SimpleEnumInfo,
	FunctionMetadataResponse,
	SchemaMetadata
} from './client/types';

/**
 * Schema lookup type for easy access to tables
 */
type SchemaLookup = Record<string, Record<string, TableMetadata>>;

/**
 * Main class for handling API requests and type generation
 */
export class TsForge {
  private baseClient: BaseClient;
  private metadataClient: MetadataClient;
  private schemaMetadata: SchemaMetadata[] = [];
  private schemaLookup: SchemaLookup = {};

  constructor(baseClient: BaseClient) {
    this.baseClient = baseClient;
    // Create metadata client instance using the base client
    this.metadataClient = new MetadataClient(this.baseClient);
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
   * Initialize forge and build lookup tables
   */
  async init(): Promise<void> {
    console.log(this.baseClient.baseUrl);
    
    // Use metadata client instead of direct baseClient call
    this.schemaMetadata = await this.metadataClient.getSchemas();
    
    // Build lookup table for easy access
    this.schemaLookup = this.schemaMetadata.reduce((acc, schema) => {
      acc[schema.name] = schema.tables;
      return acc;
    }, {} as SchemaLookup);

    log.info(dim('Loaded schema metadata: ') + cyan(this.schemaMetadata.map(s => s.name).join(', ')));
  }

  /**
   * Get all metadata for a specific schema
   */
  async getSchemaMetadata(schema: string): Promise<{
    tables: TableMetadata[];
    views: ViewMetadata[];
	enum: SimpleEnumInfo[];
    functions: FunctionMetadataResponse[];
    procedures: FunctionMetadataResponse[];
    triggers: FunctionMetadataResponse[];
  }> {
    const [tables, views, enums, functions, procedures, triggers] = await Promise.all([
      this.metadataClient.getTables(schema),
      this.metadataClient.getViews(schema),
	  this.metadataClient.getEnums(schema),
      this.metadataClient.getFunctions(schema),
      this.metadataClient.getProcedures(schema),
      this.metadataClient.getTriggers(schema)
    ]);

    return { tables, views, enum: enums, functions, procedures, triggers };
  }

  // Health check methods
  async getHealth(): Promise<HealthStatus> {
    return this.baseClient.get<HealthStatus>('/health');
  }

  async ping(): Promise<string> {
    return this.baseClient.get<string>('/health/ping');
  }

  async getCacheStatus(): Promise<CacheStatus> {
    return this.baseClient.get<CacheStatus>('/health/cache');
  }

  async clearCache(): Promise<{ status: string; message: string }> {
    return this.baseClient.post('/health/clear-cache');
  }

  async genSchemaTypes(schemas: string[]): Promise<void> {
    await removeDir('src/gen');
    await ensureDir('src/gen');

    // Fetch complete metadata for each schema
    const metadata = await Promise.all(
      schemas.map(async schema => ({
        schema,
        metadata: await this.getSchemaMetadata(schema)
      }))
    );

    // TODO: Implement type generation
    // await generateTypes(metadata);
    
    log.info(dim('Generated types for schemas: ') + cyan(schemas.join(', ')));
    log.info(dim('Generated index file for schemas: ') + cyan('src/gen/index.ts'));
    
    await writeFiles([{
      path: 'src/gen/metadata.json',
      content: JSON.stringify(this.schemaMetadata)
    }]);
  }
}