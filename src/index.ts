import { log, cyan, green, yellow } from './tools/logging';

/**
 * Configuration for the API client
 */
export interface ForgeConfig {
  baseUrl?: string;
}

/**
 * Main class for handling API requests
 */
export class TsForge {
  private baseUrl: string;

  constructor(config?: ForgeConfig) {
    this.baseUrl = config?.baseUrl || 'http://localhost:8000';
    log.success(`Initialized TsForge with baseUrl: ${cyan(this.baseUrl)}`);
  }
}

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
