export function forge_init(): string {
  let forge_str = "This fn is called from forge_init";
  console.log(forge_str);
  return forge_str;
}


// todo: Remove the `../` relative path and use the package name
export function app_dt() {
  console.clear();

  const pkg = require('../package.json');
  console.log(`\x1b[32m${pkg.name}\x1b[0m v\x1b[34m${pkg.version}\x1b[0m\n`);
}


// todo: Plan the main pkg functions

// todo: Move this to it's own 'ANSI-formatter' package
export const red = (str: string): string => `\x1b[31m${str}\x1b[0m`;
export const green = (str: string): string => `\x1b[32m${str}\x1b[0m`;
export const yellow = (str: string): string => `\x1b[33m${str}\x1b[0m`;
export const blue = (str: string): string => `\x1b[34m${str}\x1b[0m`;
export const magenta = (str: string): string => `\x1b[35m${str}\x1b[0m`;
export const cyan = (str: string): string => `\x1b[36m${str}\x1b[0m`;

