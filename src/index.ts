import { log, cyan, green, yellow } from './tools/logging';


// * Re-export the TsForge class and genTypes function...
import { TsForge, baseClient } from './forge';
export { TsForge , baseClient};


/**
 * Initialize the forge
 */
export function forgeInit(): string {
  log.info("TS Forge initialized");
  return "TS Forge initialized";
}

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
