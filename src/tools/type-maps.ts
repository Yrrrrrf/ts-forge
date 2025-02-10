// src/tools/type-maps.ts

/**
 * PostgreSQL to TypeScript type mapping definitions
 */
export interface TypeMapping {
	tsType: string;
	defaultValue?: string;
	validation?: (value: unknown) => boolean;
}

/**
 * Comprehensive mapping of PostgreSQL types to TypeScript types
 */
export const PG_TYPE_MAPPINGS: Record<string, TypeMapping> = {
	// Numeric Types
	smallint: { tsType: "number" },
	integer: { tsType: "number" },
	bigint: { tsType: "number" },
	decimal: { tsType: "number" },
	numeric: { tsType: "number" },
	real: { tsType: "number" },
	"double precision": { tsType: "number" },
	serial: { tsType: "number" },
	bigserial: { tsType: "number" },

	// Character Types
	character: { tsType: "string" },
	"character varying": { tsType: "string" },
	varchar: { tsType: "string" },
	text: { tsType: "string" },

	// Boolean Type
	boolean: { tsType: "boolean" },

	// Date/Time Types
	timestamp: { tsType: "Date" },
	"timestamp with time zone": { tsType: "Date" },
	"timestamp without time zone": { tsType: "Date" },
	date: { tsType: "Date" },
	time: { tsType: "string" },
	"time with time zone": { tsType: "string" },
	"time without time zone": { tsType: "string" },
	interval: { tsType: "string" },

	// UUID Type
	uuid: { tsType: "string" },

	// JSON Types
	json: { tsType: "Record<string, unknown>" },
	jsonb: { tsType: "Record<string, unknown>" },

	// Array Types
	_int4: { tsType: "number[]" },
	_text: { tsType: "string[]" },
	_varchar: { tsType: "string[]" },
	_bool: { tsType: "boolean[]" },
	_timestamp: { tsType: "Date[]" },
	_uuid: { tsType: "string[]" },

	// Network Address Types
	inet: { tsType: "string" },
	cidr: { tsType: "string" },
	macaddr: { tsType: "string" },
	macaddr8: { tsType: "string" },

	// Geometric Types
	point: { tsType: "string" },
	line: { tsType: "string" },
	lseg: { tsType: "string" },
	box: { tsType: "string" },
	path: { tsType: "string" },
	polygon: { tsType: "string" },
	circle: { tsType: "string" },

	// Money Type
	money: { tsType: "string" },

	// Bit String Types
	bit: { tsType: "string" },
	"bit varying": { tsType: "string" },

	// Text Search Types
	tsvector: { tsType: "string" },
	tsquery: { tsType: "string" },

	// XML Type
	xml: { tsType: "string" },
};

/**
 * Maps a PostgreSQL type to its corresponding TypeScript type
 */
export function mapPgTypeToTs(pgType: string): string {
	// Remove any length specifiers, e.g., varchar(255) -> varchar
	const baseType = pgType
		.toLowerCase()
		.replace(/\(.*\)/, "")
		.trim();

	const mapping = PG_TYPE_MAPPINGS[baseType];
	if (!mapping) {
		console.warn(
			`Unknown PostgreSQL type: ${pgType}, defaulting to 'unknown'`,
		);
		return "unknown";
	}

	return mapping.tsType;
}

/**
 * Type validation functions
 */
export const typeValidators = {
	isString: (value: unknown): value is string => typeof value === "string",
	isNumber: (value: unknown): value is number =>
		typeof value === "number" && !isNaN(value),
	isBoolean: (value: unknown): value is boolean => typeof value === "boolean",
	isDate: (value: unknown): value is Date =>
		value instanceof Date && !isNaN(value.getTime()),
	isArray: (value: unknown): value is unknown[] => Array.isArray(value),
	isObject: (value: unknown): value is Record<string, unknown> =>
		typeof value === "object" && value !== null && !Array.isArray(value),
	isUUID: (value: unknown): boolean => {
		if (typeof value !== "string") return false;
		return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
			value,
		);
	},
};

/**
 * Validates a value against its expected PostgreSQL type
 */
export function validatePgValue(value: unknown, pgType: string): boolean {
	const baseType = pgType
		.toLowerCase()
		.replace(/\(.*\)/, "")
		.trim();
	const mapping = PG_TYPE_MAPPINGS[baseType];

	if (!mapping) {
		console.warn(`Unknown PostgreSQL type: ${pgType}, skipping validation`);
		return true;
	}

	if (value === null || value === undefined) {
		return true; // Assuming nullable by default
	}

	switch (mapping.tsType) {
		case "string":
			return typeValidators.isString(value);
		case "number":
			return typeValidators.isNumber(value);
		case "boolean":
			return typeValidators.isBoolean(value);
		case "Date":
			return typeValidators.isDate(value);
		case "Record<string, unknown>":
			return typeValidators.isObject(value);
		default:
			if (mapping.tsType.endsWith("[]")) {
				return typeValidators.isArray(value);
			}
			return true; // Allow other types to pass through
	}
}

/**
 * Converts a value to its expected TypeScript type based on PostgreSQL type
 */
export function convertToTsType(value: unknown, pgType: string): unknown {
	if (value === null || value === undefined) {
		return null;
	}

	const baseType = pgType
		.toLowerCase()
		.replace(/\(.*\)/, "")
		.trim();
	const mapping = PG_TYPE_MAPPINGS[baseType];

	if (!mapping) {
		return value;
	}

	try {
		switch (mapping.tsType) {
			case "string":
				return String(value);
			case "number":
				return Number(value);
			case "boolean":
				return Boolean(value);
			case "Date":
				return new Date(value as string);
			case "Record<string, unknown>":
				return typeof value === "string" ? JSON.parse(value) : value;
			default:
				if (
					mapping.tsType.endsWith("[]") &&
					typeof value === "string"
				) {
					return JSON.parse(value);
				}
				return value;
		}
	} catch (error) {
		console.error(
			`Error converting value to type ${mapping.tsType}:`,
			error,
		);
		return value;
	}
}
