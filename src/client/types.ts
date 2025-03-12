// src/schema/gen-types.ts
import { ensureDir, removeDir, writeFiles } from "../tools/fs-ops";
import { colors, log, styles } from "../tools/logging";
import { mapPgTypeToTs } from "../tools/type-maps";

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
	is_pk?: boolean;
	is_enum?: boolean;
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

/**
 * Class responsible for generating TypeScript type definitions from database metadata
 */
export class TypeGenerator {
	private indent = "  ";

	/**
	 * Generate TypeScript interface for a table
	 */
	private generateTableInterface(table: TableMetadata): string {
		const lines = [
			`export interface ${this.getInterfaceName(table.name)} {`,
		];
		// Generate properties for each column
		for (const column of table.columns) {
			lines.push(this.generateColumnProperty(column));
		}
		lines.push("}");
		return lines.join("\n");
	}

	/**
	 * Generate TypeScript view interface
	 */
	private generateViewInterface(view: ViewMetadata): string {
		const lines = [
			`export interface ${this.getInterfaceName(view.name)}View {`,
		];

		for (const column of view.view_columns) {
			const tsType = mapPgTypeToTs(column.type);
			const nullable = column.nullable ? "?" : "";
			lines.push(`${this.indent}${column.name}${nullable}: ${tsType};`);
		}

		lines.push("}");
		return lines.join("\n");
	}

	/**
	 * Generate TypeScript enum type
	 */
	private generateEnumType(enumInfo: SimpleEnumInfo): string {
		const lines = [`export enum ${this.getInterfaceName(enumInfo.name)} {`];

		enumInfo.values.forEach((value: string) => {
			lines.push(`${this.indent}${value} = '${value}',`);
		});

		lines.push("}");
		return lines.join("\n");
	}

	/**
	 * Generate TypeScript type for a column
	 */
	private generateColumnProperty(column: any): string {
		const typeStr = mapPgTypeToTs(column.type);
		const optional = column.nullable ? "?" : "";
		return `${this.indent}${column.name}${optional}: ${typeStr};`;
	}

	/**
	 * Generate query params interface for a table
	 */
	generateQueryInterface(table: TableMetadata): string {
		const name = this.getInterfaceName(table.name);
		const lines = [`export interface ${name}QueryParams {`];

		// All query params are optional
		for (const column of table.columns) {
			lines.push(
				`${this.indent}${column.name}?: ${mapPgTypeToTs(column.type)};`,
			);
		}

		lines.push("}");
		return lines.join("\n");
	}

	/**
	 * Convert string to PascalCase
	 */
	private getInterfaceName(str: string): string {
		return str
			.split("_")
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join("");
	}

	genJson(schemas: SchemaMetadata[]) {
		let path = "src/gen/";
		ensureDir(path);

		writeFiles([
			{
				path: `${path}/metadata.json`,
				content: JSON.stringify(schemas, null, "\t"),
			},
		]);
	}

	/**
	 * Generate TypeScript type definitions for the specified schemas
	 */
	async genTsTypes(schemas: SchemaMetadata[]): Promise<void> {
		try {
			let path = "src/gen/";
			// await removeDir(path);
			await ensureDir(path); // * Ensure directory exists

			// Generate types for each schema
			for (const schema of schemas) {
				// Generate interfaces for tables
				let content = `// Generated types for schema: ${schema.name}\n\n`;
				// Add table types
				Object.values(schema.tables).forEach((table) => {
					content += this.generateTableInterface(table) + "\n\n";
				});
				// Add view types
				Object.values(schema.views).forEach((view) => {
					content += this.generateViewInterface(view) + "\n\n";
				});
				// Add enum types
				Object.values(schema.enums).forEach((enumInfo) => {
					content += this.generateEnumType(enumInfo) + "\n\n";
				});
				// todo: Add gen (fn, proc, trigger) types

				await writeFiles([
					{
						path: `${path}/types-${schema.name}.ts`,
						content: content,
					},
				]);
				log.debug(styles.dim("Gen types for: ") + colors.cyan(schema.name));
			}

			await writeFiles([
				{
					path: "src/gen/index.ts", // * Generate index file
					content:
						schemas
							.map(
								(schema) =>
									`export * from './types-${schema.name}';`,
							)
							.join("\n") + "\n",
				},
			]);
			log.info(styles.dim("Generated index file: ") + colors.cyan("src/gen/index.ts"));
		} catch (error) {
			console.error("Error generating types:", error);
			throw error;
		}
	}
}

// Schema content type extractors
export type SchemaTable<S extends SchemaMetadata> =
	S["tables"][keyof S["tables"]];
export type SchemaView<S extends SchemaMetadata> = S["views"][keyof S["views"]];
export type SchemaEnum<S extends SchemaMetadata> = S["enums"][keyof S["enums"]];
export type SchemaFunction<S extends SchemaMetadata> =
	S["functions"][keyof S["functions"]];

// Type guard functions
export const isTable = (content: any): content is TableMetadata => {
	return content && "columns" in content;
};

export const isView = (content: any): content is ViewMetadata => {
	return content && "view_columns" in content;
};

export const isEnum = (content: any): content is SimpleEnumInfo => {
	return content && "values" in content;
};

export const isFunction = (
	content: any,
): content is FunctionMetadataResponse => {
	return content && "parameters" in content && "return_type" in content;
};
