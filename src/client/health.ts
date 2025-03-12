import { BaseClient } from "./base";
import { CacheStatus, HealthStatus } from "./types";

// Define the interface first
export interface HealthApi {
    checkHealth(): Promise<HealthStatus>;
    checkPing(): Promise<string>;
    checkCache(): Promise<CacheStatus>;
    clearCache(): Promise<{ status: string; message: string }>;
}

// Create a mixin class that implements the interface
export class HealthApiImplementation implements HealthApi {
    constructor(private baseClient: BaseClient) {}

    async checkHealth(): Promise<HealthStatus> {
        return this.baseClient.get<HealthStatus>("/health");
    }

    async checkPing(): Promise<string> {
        return this.baseClient.get<string>("/health/ping");
    }

    async checkCache(): Promise<CacheStatus> {
        return this.baseClient.get<CacheStatus>("/health/cache");
    }

    async clearCache(): Promise<{ status: string; message: string }> {
        return this.baseClient.post("/health/clear-cache");
    }
}
