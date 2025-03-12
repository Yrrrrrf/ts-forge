// * Import all the modules and export them

// todo: Improve the importing
// todo: Add new re-exports for:
// todo: + ts-sql types equivalent
// todo: + some enhanced v of init_forge() fn
// todo: + some enhanced v of appDt() fn

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
	ViewMetadata,
	SimpleEnumInfo,
	FunctionMetadataResponse,
	ColumnRef
} from "./client/types";

export { mapPgTypeToTs } from "./tools/type-maps";

import { log, styles, colors, backgrounds } from "./tools/logging";
export { log } from "./tools/logging";

export function appDt(): void {
	console.clear();
	console.log(colors.cyan("TS Forge"));
}

export function init_forge(): string {
	log.debug("init_forge function called.");
	return "This fn is called from forge_init";
}

import { BaseClient } from "./client/base";
import { TsForge } from "./forge";


export async function localForge(port: number = 8000): Promise<TsForge> {
    const baseClient = new BaseClient(`http://localhost:${port}`);
    const forge = new TsForge(baseClient);
	const health = await forge.checkHealth();
	
	log.info(`API Status: ${health.status}`);
	log.info(`API Version: ${health.version}`);

	forge.checkPing();
	forge.display();
	forge.displayDiscoveries();

	return forge;
}
