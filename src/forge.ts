// src/forge.ts
import { BaseClient } from "./client/base";
import { MetadataClient } from "./client/metadata";
import { dim, log } from "./tools/logging";

import {
	HealthStatus,
	CacheStatus,
	TableMetadata,
	SchemaMetadata,
	TypeGenerator,
	ViewMetadata,
	SimpleEnumInfo,
	FunctionMetadataResponse,
} from "./client/types";
import { SchemaDisplay } from "./tools/schema-display";
import { createCrudOperations } from "./client/crud";

export interface BaseEntity {
    id: string;
    [key: string]: any;
}
// Helper type to infer the entity type from table metadata
export type TableEntity<T> = T extends TableMetadata ? {
    [K in keyof T['columns']]: T['columns'][K] extends { type: infer Type } ? Type : never;
} & BaseEntity : never;

// Type utilities for schema access
type SchemaName<T> = T extends { name: infer N } ? N : never;
type TableName<T> = T extends { tables: Record<infer K, any> } ? K : never;
type ViewName<T> = T extends { views: Record<infer K, any> } ? K : never;
type EnumName<T> = T extends { enums: Record<infer K, any> } ? K : never;
type FunctionName<T> = T extends { functions: Record<infer K, any> }
	? K
	: never;

export class TsForge {
	baseClient: BaseClient;
	schemaMetadata: SchemaMetadata[] = [];
	private initPromise: Promise<void>;

	constructor(baseClient: BaseClient) {
		this.baseClient = baseClient;
		this.initPromise = this.initialize();	
	}

	// * Initialization

    // * Initialization
    private async initialize(): Promise<void> {
        log.info("Initializing TsForge...");
        let metadataClient = new MetadataClient(this.baseClient);
        this.schemaMetadata = await metadataClient.getSchemas();
        
        log.info(
            `Loaded schemas: ${dim(this.schemaMetadata.map((s) => s.name).join(", "))}`,
        );
    }

    async displaySchema() {
        await this.ensureInitialized();
        new SchemaDisplay(this.schemaMetadata).display();
    }

    async displayDiscoveries() {
        await this.ensureInitialized();
        new SchemaDisplay(this.schemaMetadata).displayDiscoveries();
    }

	private async ensureInitialized(): Promise<void> {
		await this.initPromise;
	}

    // * Schema operators
    async getTableOperations<T extends BaseEntity = any>(
        schemaName: string,
        tableName: string
    ) {
        const table = await this.getTable(schemaName, tableName);
        if (!table) {
            throw new Error(`Table ${schemaName}.${tableName} not found`);
        }
        return createCrudOperations<T>(this.baseClient, table);
    }


	// * Schema access

	// Schema access methods with type safety
	async getSchema(name: string): Promise<SchemaMetadata | undefined> {
		await this.ensureInitialized();
		return this.schemaMetadata.find((s) => s.name === name);
	}

	async getTable(
		schemaName: string,
		tableName: string,
	): Promise<TableMetadata | undefined> {
		const schema = await this.getSchema(schemaName);
		return schema?.tables[tableName];
	}

	async getView(
		schemaName: string,
		viewName: string,
	): Promise<ViewMetadata | undefined> {
		const schema = await this.getSchema(schemaName);
		return schema?.views[viewName];
	}

	async getEnum(
		schemaName: string,
		enumName: string,
	): Promise<SimpleEnumInfo | undefined> {
		const schema = await this.getSchema(schemaName);
		return schema?.enums[enumName];
	}

	async getFunction(
		schemaName: string,
		funcName: string,
	): Promise<FunctionMetadataResponse | undefined> {
		const schema = await this.getSchema(schemaName);
		return schema?.functions[funcName];
	}

	// * Type Safe fn's
	async getTables(
		schemaName: string,
	): Promise<Record<string, TableMetadata>> {
		return (await this.getSchema(schemaName))?.tables ?? {};
	}

	async getViews(schemaName: string): Promise<Record<string, ViewMetadata>> {
		return (await this.getSchema(schemaName))?.views ?? {};
	}

	async getEnums(
		schemaName: string,
	): Promise<Record<string, SimpleEnumInfo>> {
        return (await this.getSchema(schemaName))?.enums ?? {};
	}

    // todo: Handle this as it should.
	async getFunctions(
		schemaName: string,
	): Promise<Record<string, FunctionMetadataResponse>> {
		return (await this.getSchema(schemaName))?.functions ?? {};
	}

	// * Metadata methods
	async genMetadataJson(): Promise<void> {
		await this.ensureInitialized();
		log.info("Generating JSON metadata...");
		new TypeGenerator().genJson(this.schemaMetadata);
		log.success("JSON metadata generated successfully");
	}

	async genTs(): Promise<void> {
		await this.ensureInitialized();
		log.info("Starting type generation...");
		await new TypeGenerator().genTsTypes(this.schemaMetadata);
		log.success("Type generation completed successfully");
	}

	// * Route methods
	// Health check methods (these don't require initialization)
	async getHealth(): Promise<HealthStatus> {
		return this.baseClient.get<HealthStatus>("/health");
	}

	async ping(): Promise<string> {
		return this.baseClient.get<string>("/health/ping");
	}

	async getCacheStatus(): Promise<CacheStatus> {
		return this.baseClient.get<CacheStatus>("/health/cache");
	}

	async clearCache(): Promise<{ status: string; message: string }> {
		return this.baseClient.post("/health/clear-cache");
	}
}
