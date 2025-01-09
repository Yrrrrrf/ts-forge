import fs from 'fs/promises';
import { cyan, log } from './tools/logging';

import { createSchemaMetadataFetcher } from './schema/metadata';
import { BaseClient, baseClient, ForgeConfig } from './client/base';

export { BaseClient, baseClient, ForgeConfig } from './client/base';

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
    const fetcher = createSchemaMetadataFetcher(this.baseClient);
    const metadata = await fetcher.fetchMetadata(schemas);
    const types = fetcher.generateTypeDefinitions(metadata);
    console.log(types);
    
    // await fs.writeFile('src/generated/types.ts', JSON.stringify(types, null, 2));
    log.success('Generated types');
  }

}
  