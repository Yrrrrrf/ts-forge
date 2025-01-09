// src/forge.ts
import fs from 'fs/promises';
import { cyan, dim, log } from './tools/logging';
import { BaseClient, baseClient, ForgeConfig } from './client/base';
import { 
  ApiSchemaMetadata,
  fetchSchemaMetadata,
  generateInterface,
  generateIndexContent
} from './schema/gen-types';

export { BaseClient, baseClient, ForgeConfig } from './client/base';

/**
 * Main class for handling API requests and type generation
 */
export class TsForge {
  baseClient: BaseClient;

  constructor(baseClient: BaseClient) {
    this.baseClient = baseClient;
    log.success(`Initialized TsForge with baseUrl: ${cyan(this.baseClient.config.baseUrl)}`);
  }

  /**
   * Initialize the TsForge class
   */
  static async init(config?: ForgeConfig): Promise<TsForge> {
    return new TsForge(baseClient);
  }

  /**
   * Generate types for a single schema
   */
  private async genSchemaTypes(schema: string, schemaMetadata: ApiSchemaMetadata[]): Promise<void> {
    const schemaData = schemaMetadata.find(s => s.name === schema);
    if (!schemaData) {
      log.warn(`Schema ${schema} not found in metadata`);
      return;
    }

    const tables = Object.values(schemaData.tables);
    const types = tables.map(generateInterface).join('\n\n');

    await fs.mkdir('src/gen', { recursive: true });
    await fs.writeFile(`src/gen/types-${schema}.ts`, types);
    
    log.info(dim('\tGenerated types for schema: ') + cyan(schema) + dim(`[${tables.length} tables]`));
  }

  /**
   * Generate types for multiple schemas and create index file
   */
  async genTTypes(schemas: string[]): Promise<void> {
      // Fetch metadata for all schemas
      const schemaMetadata = await fetchSchemaMetadata();
      
      // Generate individual schema files
      await Promise.all(
        schemas.map(schema => this.genSchemaTypes(schema, schemaMetadata))
      );

      // Generate index.ts file
      const indexContent = generateIndexContent(schemas);
      await fs.writeFile('src/gen/index.ts', indexContent);

      console.log('\tGen types for schemas:' + '\n\t' + cyan(schemas.join('\n\t')));
      log.info(dim('Types are available in ') + cyan('src/gen/'));
  }
}
