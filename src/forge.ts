import fs from 'fs/promises';
import { cyan, log } from './tools/logging';

import { BaseClient, baseClient, ForgeConfig } from './client/base';
export { BaseClient, baseClient, ForgeConfig } from './client/base';

import { ApiColumnMetadata, type ApiSchemaMetadata, ApiTableMetadata } from './schema/gen-types';

import { 
  fetchSchemaMetadata, 
  generateInterface
} from './schema/gen-types';

/**
 * Main class for handling API requests
 */
export class TsForge {
  baseClient: BaseClient;

  constructor(baseClient: BaseClient) {
    this.baseClient = baseClient
    log.success(`Initialized TsForge with baseUrl: ${cyan(this.baseClient.config.baseUrl)}`);
  }

  /**
   * Initialize the TsForge class
   */
  static async init(config?: ForgeConfig): Promise<TsForge> {
    return new TsForge(baseClient);
  }

  // get the types uisng the schema metadata
  async genTypes(schemas: string[]): Promise<void> {
    let schemaMetadata: ApiSchemaMetadata[] = await fetchSchemaMetadata();
    let tables: ApiTableMetadata[] = schemaMetadata.flatMap(schema => Object.values(schema.tables));
    let types = tables.map(generateInterface).join('\n\n');
    console.log(types);

    await fs.mkdir('src/generated', { recursive: true });
    await fs.writeFile('src/generated/types.ts', types);
    log.success('Generated types');
  }

}
