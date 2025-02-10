// src/tools/schema-display.ts
import { SchemaMetadata } from "../client/types";
import { log } from "./logging";

// Box drawing characters
const BOX = {
	VERTICAL: "│",
	HORIZONTAL: "─",
	TOP_T: "┬",
	BOTTOM_T: "┴",
	LEFT_T: "├",
	RIGHT_T: "┤",
	TOP_LEFT: "┌",
	TOP_RIGHT: "┐",
	BOTTOM_LEFT: "└",
	BOTTOM_RIGHT: "┘",
	CROSS: "┼",
};

// ANSI color codes
const colors = {
	reset: (s: string) => `\x1b[0m${s}\x1b[0m`,
	bright: (s: string) => `\x1b[1m${s}\x1b[0m`,
	dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
	// Base colors
	green: (s: string) => `\x1b[32m${s}\x1b[0m`,
	blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
	magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
	cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
	gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
	yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
	// Bright variants
	brightWhite: (s: string) => `\x1b[1;97m${s}\x1b[0m`,
	brightBlue: (s: string) => `\x1b[1;94m${s}\x1b[0m`,
	brightMagenta: (s: string) => `\x1b[1;95m${s}\x1b[0m`,
};

export class SchemaDisplay {
	private schemas: SchemaMetadata[];

	constructor(schemas: SchemaMetadata[]) {
		this.schemas = schemas;
	}

	private createSeparator(widths: number[]): string {
		const lines = widths.map((w) => BOX.HORIZONTAL.repeat(w + 2));
		return BOX.LEFT_T + lines.join(BOX.CROSS) + BOX.RIGHT_T;
	}

	private padValue(
		value: any,
		width: number,
		align: "left" | "right" = "left",
	): string {
		const str = String(value);
		const padding = " ".repeat(Math.max(0, width - str.length));
		return align === "left" ? str + padding : padding + str;
	}

	public display(): void {
		const title = "ModelForge Statistics";
		const header = "=".repeat(50);
		console.log(`\n${header}\n${title}\n${header}\n`);

		// Column definitions
		const columns = [
			{ header: "Schema", width: 18, color: colors.magenta },
			{ header: "Tables", width: 8, color: colors.green },
			{ header: "Views", width: 8, color: colors.brightBlue },
			{ header: "Enums", width: 8, color: colors.yellow },
			{ header: "Fn's", width: 8, color: colors.brightMagenta },
			{ header: "Proc's", width: 8, color: colors.brightMagenta },
			{ header: "Trig's", width: 8, color: colors.brightMagenta },
			{ header: "Total", width: 8 },
		];

		const widths = columns.map((c) => c.width);

		// Create header row
		const topBorder =
			BOX.TOP_LEFT +
			widths.map((w) => BOX.HORIZONTAL.repeat(w + 2)).join(BOX.TOP_T) +
			BOX.TOP_RIGHT;
		const headerRow =
			BOX.VERTICAL +
			columns
				.map(
					(col) =>
						` ${colors.brightWhite(this.padValue(col.header, col.width))} `,
				)
				.join(BOX.VERTICAL) +
			BOX.VERTICAL;

		console.log(topBorder);
		console.log(headerRow);
		console.log(this.createSeparator(widths));

		// Print schema rows
		for (const schema of this.schemas) {
			const stats = {
				tables: Object.keys(schema.tables || {}).length,
				views: Object.keys(schema.views || {}).length,
				enums: Object.keys(schema.enums || {}).length,
				functions: Object.keys(schema.functions || {}).length,
				procedures: Object.keys(schema.procedures || {}).length,
				triggers: Object.keys(schema.triggers || {}).length,
			};

			const total = Object.values(stats).reduce((a, b) => a + b, 0);

			const row = [
				colors.magenta(this.padValue(schema.name, widths[0])),
				colors.green(this.padValue(stats.tables, widths[1], "right")),
				colors.brightBlue(
					this.padValue(stats.views, widths[2], "right"),
				),
				colors.yellow(this.padValue(stats.enums, widths[3], "right")),
				colors.brightMagenta(
					this.padValue(stats.functions, widths[4], "right"),
				),
				colors.brightMagenta(
					this.padValue(stats.procedures, widths[5], "right"),
				),
				colors.brightMagenta(
					this.padValue(stats.triggers, widths[6], "right"),
				),
				colors.brightWhite(this.padValue(total, widths[7], "right")),
			];

			console.log(
				BOX.VERTICAL +
					row.map((cell) => ` ${cell} `).join(BOX.VERTICAL) +
					BOX.VERTICAL,
			);
		}

		// Calculate and print totals
		const totals = this.schemas.reduce(
			(acc, schema) => ({
				tables: acc.tables + Object.keys(schema.tables || {}).length,
				views: acc.views + Object.keys(schema.views || {}).length,
				enums: acc.enums + Object.keys(schema.enums || {}).length,
				functions:
					acc.functions + Object.keys(schema.functions || {}).length,
				procedures:
					acc.procedures +
					Object.keys(schema.procedures || {}).length,
				triggers:
					acc.triggers + Object.keys(schema.triggers || {}).length,
			}),
			{
				tables: 0,
				views: 0,
				enums: 0,
				functions: 0,
				procedures: 0,
				triggers: 0,
			},
		);

		const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

		console.log(this.createSeparator(widths));

		const totalRow = [
			colors.brightWhite(this.padValue("TOTAL", widths[0])),
			colors.green(this.padValue(totals.tables, widths[1], "right")),
			colors.brightBlue(this.padValue(totals.views, widths[2], "right")),
			colors.yellow(this.padValue(totals.enums, widths[3], "right")),
			colors.brightMagenta(
				this.padValue(totals.functions, widths[4], "right"),
			),
			colors.brightMagenta(
				this.padValue(totals.procedures, widths[5], "right"),
			),
			colors.brightMagenta(
				this.padValue(totals.triggers, widths[6], "right"),
			),
			colors.brightWhite(this.padValue(grandTotal, widths[7], "right")),
		];

		console.log(
			BOX.VERTICAL +
				totalRow.map((cell) => ` ${cell} `).join(BOX.VERTICAL) +
				BOX.VERTICAL,
		);

		const bottomBorder =
			BOX.BOTTOM_LEFT +
			widths.map((w) => BOX.HORIZONTAL.repeat(w + 2)).join(BOX.BOTTOM_T) +
			BOX.BOTTOM_RIGHT;
		console.log(bottomBorder + "\n");
	}

	public displayDiscoveries(): void {
		console.log(colors.bright("\n[Type Discovery Summary]"));

		this.schemas.forEach((schema) => {
			const hasContent =
				Object.keys(schema.tables || {}).length > 0 ||
				Object.keys(schema.views || {}).length > 0 ||
				Object.keys(schema.enums || {}).length > 0 ||
				Object.keys(schema.functions || {}).length > 0;

			if (!hasContent) return;

			let sum = 0;
			sum += Object.keys(schema.tables || {}).length;
			sum += Object.keys(schema.views || {}).length;
			sum += Object.keys(schema.enums || {}).length;
			sum += Object.keys(schema.functions || {}).length;
			sum += Object.keys(schema.procedures || {}).length;
			sum += Object.keys(schema.triggers || {}).length;
			console.log(
				`\nSchema: ${colors.magenta(schema.name)} [${colors.brightWhite(String(sum))}]`,
			);

			// Tables
			const tableCnt = Object.keys(schema.tables || {}).length;
			if (tableCnt > 0) {
				console.log(
					`  ${colors.green("━")} discovered ${colors.green(String(tableCnt))} tables:`,
				);
				Object.keys(schema.tables).forEach((table) => {
					console.log(
						`    ${colors.gray("⊢")} ${colors.dim(schema.name)}.${colors.green(table)}`,
					);
				});
			}

			// Views
			const viewCnt = Object.keys(schema.views || {}).length;
			if (viewCnt > 0) {
				console.log(
					`  ${colors.brightBlue("━")} discovered ${colors.brightBlue(String(viewCnt))} views:`,
				);
				Object.keys(schema.views).forEach((view) => {
					console.log(
						`    ${colors.gray("⊢")} ${colors.dim(schema.name)}.${colors.brightBlue(view)}`,
					);
				});
			}

			// Enums
			const enumCnt = Object.keys(schema.enums || {}).length;
			if (enumCnt > 0) {
				console.log(
					`  ${colors.yellow("━")} discovered ${colors.yellow(String(enumCnt))} enums:`,
				);
				Object.keys(schema.enums).forEach((enum_) => {
					console.log(
						`    ${colors.gray("⊢")} ${colors.dim(schema.name)}.${colors.yellow(enum_)} ${colors.gray(`(${schema.enums[enum_].values.length} values)`)}`,
					);
				});
			}

			// Functions
			const fnCnt = Object.keys(schema.functions || {}).length;
			const procCnt = Object.keys(schema.procedures || {}).length;
			const trigCnt = Object.keys(schema.triggers || {}).length;
			const total = fnCnt + procCnt + trigCnt;

			if (total > 0) {
				console.log(
					`  ${colors.brightMagenta("━")} discovered ${colors.brightMagenta(String(total))} callables:`,
				);

				// Regular functions
				Object.keys(schema.functions || {}).forEach((fn) => {
					const func = schema.functions[fn];
					console.log(
						`    ${colors.gray("⊢")} ${colors.dim(schema.name)}.${colors.brightMagenta(fn)} ${colors.gray(`(${func.parameters?.length || 0} params)`)} ${colors.gray("→")} ${colors.dim(func.return_type || "void")}`,
					);
				});

				// Procedures
				Object.keys(schema.procedures || {}).forEach((proc) => {
					const procedure = schema.procedures[proc];
					console.log(
						`    ${colors.gray("⊢")} ${colors.dim(schema.name)}.${colors.brightMagenta(proc)} ${colors.gray(`(${procedure.parameters?.length || 0} params)`)} ${colors.gray("procedure")}`,
					);
				});

				// Triggers
				Object.keys(schema.triggers || {}).forEach((trig) => {
					console.log(
						`    ${colors.gray("⊢")} ${colors.dim(schema.name)}.${colors.brightMagenta(trig)} ${colors.gray("trigger")}`,
					);
				});
			}
		});
		console.log();
	}
}
