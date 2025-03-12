// TODO: Complete todo's on this module...

// src/forge.ts
import { BaseClient } from "./client/base";
import { log, styles } from "./tools/logging";

import {
	TableMetadata,
	SchemaMetadata,
} from "./client/types";
import { SchemaDisplay } from "./tools/schema-display";
import { HealthApi, HealthApiImplementation } from "./client/health";
import { SchemaOperators, SchemaOperatorsImpl } from "./client/operators";
import { MetadataGen } from "./client/metadata";
import { createCrudOperations } from "./client/crud";

export interface BaseEntity {
    id: string;
    [key: string]: any;
}

// Helper type to infer the entity type from table metadata
export type TableEntity<T> = T extends TableMetadata ? {
    [K in keyof T['columns']]: T['columns'][K] extends { type: infer Type } ? Type : never;
} & BaseEntity : never;

export class TsForge implements HealthApi {
	private healthApi: HealthApi;
	baseClient: BaseClient;
	schemaMetadata: SchemaMetadata[] = [];
	ops!: SchemaOperators;

	constructor(baseClientOrUrl: string | BaseClient) {	
		switch (typeof baseClientOrUrl) {
			case "string": this.baseClient = new BaseClient(baseClientOrUrl); break;
			default: this.baseClient = baseClientOrUrl; break;
		}
		this.healthApi = new HealthApiImplementation(this.baseClient);
		this.initialize().then(() => log.success("TsForge initialized"));

	}

	private async initialize(): Promise<void> {
		log.info("Initializing TsForge...");
		this.schemaMetadata = await this.baseClient.get<SchemaMetadata[]>("/dt/schemas")
		this.ops = new SchemaOperatorsImpl(this.baseClient, this.schemaMetadata);

		log.info(`Loaded schemas: ${styles.dim(this.schemaMetadata.map((s) => s.name).join(", "))}`);
	}

    // * Health API
    checkHealth = () => this.healthApi.checkHealth();
    checkPing = () => this.healthApi.checkPing();
    checkCache = () => this.healthApi.checkCache();
    clearCache = () => this.healthApi.clearCache();

	// * Metadata generators
	genTs = () => new MetadataGen(this.schemaMetadata).ts();
	genJson = () => new MetadataGen(this.schemaMetadata).json();

	// * Display schema
	display = () => new SchemaDisplay(this.schemaMetadata).display();
	displayDiscoveries = () => new SchemaDisplay(this.schemaMetadata).displayDiscoveries();


	// * Some...
	async getTableOperations<T extends BaseEntity = any>(schemaName: string, tableName: string) {
		const table = await this.ops.getTable(schemaName, tableName);
		if (!table) {
			throw new Error(`Table ${schemaName}.${tableName} not found`);
		}
		return createCrudOperations<T>(this.baseClient, table);
	}

}
