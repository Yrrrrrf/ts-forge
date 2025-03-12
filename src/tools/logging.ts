/**
 * Utility for color formatting
 */
const color = (color: string, str: string): string =>
	`\x1b[${color}m${str}\x1b[0m`;

export const styles = {
	reset: "\x1b[0m",
	bold: (s: string) => color("1", s),
	dim: (s: string) => color("2", s),
	italic: (s: string) => color("3", s),
	underline: (s: string) => color("4", s),
	// blink: (s: string) => color("5", s),
	// reverse: (s: string) => color("7", s),
	// hidden: (s: string) => color("8", s),
	strike: (s: string) => color("9", s),
};

export const colors = {
	// Normal colors
	black: (s: string) => color("30", s),
	red: (s: string) => color("31", s),
	green: (s: string) => color("32", s),
	yellow: (s: string) => color("33", s),
	blue: (s: string) => color("34", s),
	magenta: (s: string) => color("35", s),
	cyan: (s: string) => color("36", s),
	gray: (s: string) => color("90", s),

    // Bright variants
	brightBlack: (s: string) => color("1;90", s),
	brightRed: (s: string) => color("1;91", s),
	brightGreen: (s: string) => color("1;92", s),
	brightYellow: (s: string) => color("1;93", s),
	brightBlue: (s: string) => color("1;94", s),
	brightMagenta: (s: string) => color("1;95", s),
	brightCyan: (s: string) => color("1;96", s),
	brightWhite: (s: string) => color("1;97", s),
};

export const backgrounds = {
	black: (s: string) => color("40", s),
	red: (s: string) => color("41", s),
	green: (s: string) => color("42", s),
	yellow: (s: string) => color("43", s),
	blue: (s: string) => color("44", s),
	magenta: (s: string) => color("45", s),
	cyan: (s: string) => color("46", s),
	gray: (s: string) => color("100", s),
};

/**
 * Helper to calculate the visible length of strings with ANSI escape codes
 */
export function getAnsiLength(str: string): number {
	const ansiEscape = /\x1b\[[0-9;]*m/g;
	return str.replace(ansiEscape, "").length;
}

/**
 * Padding function for aligning strings, considering ANSI escape codes
 */
export function padString(
	str: string,
	length: number,
	align: "left" | "center" | "right" = "left",
): string {
	const visibleLength = getAnsiLength(str);
	const padding = Math.max(0, length - visibleLength);

	if (align === "right") return " ".repeat(padding) + str;
	if (align === "center") {
		const leftPad = Math.floor(padding / 2);
		const rightPad = padding - leftPad;
		return " ".repeat(leftPad) + str + " ".repeat(rightPad);
	}
	return str + " ".repeat(padding); // Default is left-align
}

/**
 * Logger class for consistent logging with rich formatting
 */
export class Logger {
	private moduleName: string;
	private indentLevel: number = 0;

	constructor(moduleName: string = "TsForge") {
		this.moduleName = moduleName;
	}

	private formatMessage(
		level: string,
		colorFn: (str: string) => string,
		message: string,
	): string {
		// const timestamp = `${gray(new Date().toISOString())}`;
		// now just the date not the other stuff
		const timestamp = `${colors.gray(new Date().toISOString().slice(0, 19))}`;
		const indent = "  ".repeat(this.indentLevel);
		return `${timestamp} ${colorFn(`[${level}]`)} ${colors.cyan(`[${this.moduleName}]`)} ${indent}${message}`;
	}

	debug(message: string): void {
		console.log(this.formatMessage("DEBUG", colors.magenta, message));
	}

	info(message: string): void {
		console.log(this.formatMessage("INFO", colors.blue, message));
	}

	success(message: string): void {
		console.log(this.formatMessage("SUCCESS", colors.green, message));
	}

	warn(message: string): void {
		console.log(this.formatMessage("WARN", colors.yellow, message));
	}

	error(message: string): void {
		console.log(this.formatMessage("ERROR", colors.red, message));
	}

	critical(message: string): void {
		console.log(
			this.formatMessage("CRITICAL", (str) => colors.red(styles.bold(str)), message),
		);
	}

	/**
	 * Temporarily increase the indent level for nested logs
	 */
	indent(levels: number = 1): void {
		this.indentLevel += levels;
	}

	/**
	 * Decrease the indent level to revert indentation
	 */
	unindent(levels: number = 1): void {
		this.indentLevel = Math.max(0, this.indentLevel - levels);
	}

	/**
	 * Timer utility for measuring operation durations
	 */
	async timer<T>(operation: string, func: () => Promise<T>): Promise<T> {
		const start = Date.now();
		this.info(`Starting ${operation}...`);
		const result = await func();
		const duration = ((Date.now() - start) / 1000).toFixed(2);
		this.success(`${operation} completed in ${duration}s`);
		return result;
	}

	/**
	 * Display a styled section header
	 */
	section(title: string): void {
		console.log(
			`\n${styles.bold("=").repeat(50)}\n${styles.bold(title)}\n${styles.bold("=").repeat(50)}`,
		);
	}
}

/**
 * Shared logger instance for the application
 */
export const log = new Logger();
