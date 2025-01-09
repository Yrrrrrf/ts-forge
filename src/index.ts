// src/index.ts

/**
 * Represents a course from the API
 */
export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  credits: string;
  category: string;
  is_active: boolean;
}

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
  }

  /**
   * Fetches courses from the API
   */
  async getCourses(): Promise<Course[]> {
    try {
      const response = await fetch(`${this.baseUrl}/academic/course`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json() as Course[];
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }
}

// Also export a default instance creator if needed
export default TsForge;

/**
 * Initialize the forge
 */
export function forgeInit(): string {
  return "TS Forge initialized";
}

/**
 * Display application data
 */
export function appDt(): void {
  console.clear();
  console.log('\x1b[36m%s\x1b[0m', 'TS Forge');
}

// Color formatting utilities
export const color = (color: string, str: string): string => `\x1b[${color}m${str}\x1b[0m`;
export const red = (str: string): string => color('31', str);
export const green = (str: string): string => color('32', str);
export const yellow = (str: string): string => color('33', str);
export const blue = (str: string): string => color('34', str);
export const magenta = (str: string): string => color('35', str);
export const cyan = (str: string): string => color('36', str);


export function init_forge(): string {
  return "This fn is called from forge_init";
}
