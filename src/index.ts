import { log, cyan, green, yellow } from './tools/logging';


import * as base from './client/base';
export { base };

import * as t_types from './client/types';
export { t_types };

import * as forge from './forge';
export { forge };

import * as crud from './client/crud';
export { crud };

/**
 * Display application data
 */
export function appDt(): void {
  console.clear();
  console.log(cyan('TS Forge'));
}

export function init_forge(): string {
  log.debug("init_forge function called.");
  return "This fn is called from forge_init";
}
