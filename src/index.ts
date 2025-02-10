// * Import all the modules and export them

// src/index.ts

// * Export main client
export { BaseClient } from "./client/base";

// * Export main forge class
export { TsForge, BaseEntity } from "./forge";

// * Export crud operations
export { createCrudOperations } from "./client/crud";
export type { CrudOperations, FilterOptions } from "./client/crud";

// * Export types
// export {
// 	generateTypes
// } from './client/types';
export type {
	ColumnMetadata,
	TableMetadata,
	SchemaMetadata,
} from "./client/types";

export { mapPgTypeToTs } from "./tools/type-maps";

import { log, cyan } from "./tools/logging";
export { log } from "./tools/logging";

/**
 * Display application data
 */
export function appDt(): void {
	console.clear();
	console.log(cyan("TS Forge"));
}

export function init_forge(): string {
	log.debug("init_forge function called.");
	return "This fn is called from forge_init";
}
