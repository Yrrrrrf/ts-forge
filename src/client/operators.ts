// schema-operators.ts

import { BaseEntity } from "../forge";
import { BaseClient } from "./base";
import { createCrudOperations } from "./crud";
import { FunctionMetadataResponse, SchemaMetadata, SimpleEnumInfo, TableMetadata, ViewMetadata } from "./types";


/**
 * Defines operations for accessing schema elements and creating CRUD operations.
 */
export interface SchemaOperators {
getSchema(name: string): Promise<SchemaMetadata | undefined>;
getTable(schemaName: string, tableName: string): Promise<TableMetadata | undefined>;
getView(schemaName: string, viewName: string): Promise<ViewMetadata | undefined>;
getEnum(schemaName: string, enumName: string): Promise<SimpleEnumInfo | undefined>;
getFunction(schemaName: string, funcName: string): Promise<FunctionMetadataResponse | undefined>;

// CRUD-related operations
getTableOperations<T extends BaseEntity = any>(
	schemaName: string,
	tableName: string
): Promise<ReturnType<typeof createCrudOperations>>;
getViewOp<T extends BaseEntity = any>(schemaName: string, viewName: string): Promise<any>;
getEnumOp(schemaName: string, enumName: string): Promise<any>;
getFn<T extends BaseEntity = any>(schemaName: string, funcName: string): Promise<any>;
}

/**
 * Implementation of SchemaOperators.
 * The constructor takes a BaseClient and a helper to get the latest schema metadata.
 */
export class SchemaOperatorsImpl implements SchemaOperators {
	constructor(
		private baseClient: BaseClient,
		private getSchemaMetadata:  SchemaMetadata[]
	) {
		this.getSchemaMetadata = getSchemaMetadata;
		this.baseClient = baseClient;
	}

	async getSchema(name: string): Promise<SchemaMetadata | undefined> {
		return this.getSchemaMetadata.find(s => s.name === name);
	}

	async getTable(schemaName: string, tableName: string): Promise<TableMetadata | undefined> {
		const schema = await this.getSchema(schemaName);
		return schema?.tables[tableName];
	}

	async getView(schemaName: string, viewName: string): Promise<ViewMetadata | undefined> {
		const schema = await this.getSchema(schemaName);
		return schema?.views[viewName];
	}

	async getEnum(schemaName: string, enumName: string): Promise<SimpleEnumInfo | undefined> {
		const schema = await this.getSchema(schemaName);
		return schema?.enums[enumName];
	}

	async getFunction(schemaName: string, funcName: string): Promise<FunctionMetadataResponse | undefined> {
		const schema = await this.getSchema(schemaName);
		return schema?.functions[funcName];
	}

	async getTableOperations<T extends BaseEntity = any>(schemaName: string, tableName: string) {
		const table = await this.getTable(schemaName, tableName);
		if (!table) {
			throw new Error(`Table ${schemaName}.${tableName} not found`);
		}
		return createCrudOperations<T>(this.baseClient, table);
	}

	async getViewOp<T extends BaseEntity = any>(schemaName: string, viewName: string) {
		const view = await this.getView(schemaName, viewName);
		if (!view) {
			throw new Error(`View ${schemaName}.${viewName} not found`);
		}
		// TODO: Create READ-only operation for views.
		// e.g., return createCrudOperations<T>(this.baseClient, view);
	}

	async getEnumOp(schemaName: string, enumName: string) {
		const enumInfo = await this.getEnum(schemaName, enumName);
		if (!enumInfo) {
		throw new Error(`Enum ${schemaName}.${enumName} not found`);
		}
		// TODO: Create READ-only operation for enums.
	}

	async getFn<T extends BaseEntity = any>(schemaName: string, funcName: string) {
		const fn = await this.getFunction(schemaName, funcName);
		if (!fn) {
		throw new Error(`Function ${schemaName}.${funcName} not found`);
		}
		// TODO: Create POST-only operation for functions.
}
}

// src/client/operators.ts