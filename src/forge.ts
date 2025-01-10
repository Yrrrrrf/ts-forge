// src/forge.ts
import fs from 'fs/promises';
import { cyan, dim, log } from './tools/logging';
import { BaseClient } from './client/base';
import { 
generateTypes, 
SchemaMetadata
} from './client/types';

export { BaseClient } from './client/base';

/**
 * Main class for handling API requests and type generation
 */
export class TsForge {
	baseClient: BaseClient;
	schemaMetadata: SchemaMetadata[] = [];

	constructor(baseClient: BaseClient) {this.baseClient = baseClient;}

	/**
	 * Init post constructor...
	 * 
	 * @param schemas 
	 */
	async init(): Promise<void> {
		this.schemaMetadata = (await this.baseClient.get<SchemaMetadata[]>('dt/schemas'));
		log.info(dim('Loaded schema metadata: ') + cyan(this.schemaMetadata.map(s => s.name).join(', ')));
	}

	/**
	 * Generate types for multiple schemas and create an index file
	 */
	async genSchemaTypes(schemas: string[]): Promise<void> {
		// Ensure the `src/gen` directory exists
		await fs.mkdir('src/gen', { recursive: true });
		await generateTypes(this.schemaMetadata.filter(s => schemas.includes(s.name)));
		log.info(dim('Generated types for schemas: ') + cyan(schemas.join(', ')));
		// Generate the index.ts file
		log.info(dim('Generated index file for schemas: ') + cyan('src/gen/index.ts'));
	}
}
