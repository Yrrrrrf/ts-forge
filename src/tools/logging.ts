/**
 * Utility for color formatting
 */
export const color = (color: string, str: string): string => `\x1b[${color}m${str}\x1b[0m`;

// * fg colors
export const red = (str: string): string => color('31', str);
export const green = (str: string): string => color('32', str);
export const yellow = (str: string): string => color('33', str);
export const blue = (str: string): string => color('34', str);
export const magenta = (str: string): string => color('35', str);
export const cyan = (str: string): string => color('36', str);
export const gray = (str: string): string => color('90', str);

// * bg colors
export const bgRed = (str: string): string => color('41', str);
export const bgGreen = (str: string): string => color('42', str);
export const bgYellow = (str: string): string => color('43', str);
export const bgBlue = (str: string): string => color('44', str);
export const bgMagenta = (str: string): string => color('45', str);
export const bgCyan = (str: string): string => color('46', str);
export const bgGray = (str: string): string => color('100', str);

/**
 * Utility for text styling
 */
export const style = (style: string, str: string): string => `\x1b[${style}m${str}\x1b[0m`;
export const bold = (str: string): string => style('1', str);
export const dim = (str: string): string => style('2', str);
export const italic = (str: string): string => style('3', str);
export const underline = (str: string): string => style('4', str);
export const strike = (str: string): string => style('9', str);


/**
 * Helper to calculate the visible length of strings with ANSI escape codes
 */
export function getAnsiLength(str: string): number {
  const ansiEscape = /\x1b\[[0-9;]*m/g;
  return str.replace(ansiEscape, '').length;
}

/**
 * Padding function for aligning strings, considering ANSI escape codes
 */
export function padString(str: string, length: number, align: 'left' | 'center' | 'right' = 'left'): string {
  const visibleLength = getAnsiLength(str);
  const padding = Math.max(0, length - visibleLength);
  
  if (align === 'right') return ' '.repeat(padding) + str;
  if (align === 'center') {
    const leftPad = Math.floor(padding / 2);
    const rightPad = padding - leftPad;
    return ' '.repeat(leftPad) + str + ' '.repeat(rightPad);
  }
  return str + ' '.repeat(padding); // Default is left-align
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

  private formatMessage(level: string, colorFn: (str: string) => string, message: string): string {
    const timestamp = `${gray(new Date().toISOString())}`;
    const indent = '  '.repeat(this.indentLevel);
    return `${timestamp} ${colorFn(`[${level}]`)} ${cyan(`[${this.moduleName}]`)} ${indent}${message}`;
  }

  debug(message: string): void {
    console.log(this.formatMessage("DEBUG", gray, message));
  }

  info(message: string): void {
    console.log(this.formatMessage("INFO", blue, message));
  }

  success(message: string): void {
    console.log(this.formatMessage("SUCCESS", green, message));
  }

  warn(message: string): void {
    console.log(this.formatMessage("WARN", yellow, message));
  }

  error(message: string): void {
    console.log(this.formatMessage("ERROR", red, message));
  }

  critical(message: string): void {
    console.log(this.formatMessage("CRITICAL", (str) => red(bold(str)), message));
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
    console.log(`\n${bold('=').repeat(50)}\n${bold(title)}\n${bold('=').repeat(50)}`);
  }
}

/**
 * Shared logger instance for the application
 */
export const log = new Logger();
