import { BaseClient } from "./base";
import { FunctionMetadataResponse, SchemaMetadata,  SimpleEnumInfo,  TableMetadata, ViewMetadata } from "./types";

// src/client/metadata.ts
export class MetadataClient {
    constructor(private baseClient: BaseClient) {}
  
    // * Schema Metadata
    async getSchemas(): Promise<SchemaMetadata[]> {
      return this.baseClient.get<SchemaMetadata[]>('/dt/schemas');
    }
  
    // * Tables, Views, Enums (simple)
    async getTables(schema: string): Promise<TableMetadata[]> {
      return this.baseClient.get<TableMetadata[]>(`/dt/${schema}/tables`);
    }
    async getViews(schema: string): Promise<ViewMetadata[]> {
      return this.baseClient.get<ViewMetadata[]>(`/dt/${schema}/views`);
    }
    async getEnums(schema: string): Promise<SimpleEnumInfo[]> {
        return this.baseClient.get<SimpleEnumInfo[]>(`/dt/${schema}/enums`);
    }

    // * Functions, Procedures, Triggers
    async getFunctions(schema: string): Promise<FunctionMetadataResponse[]> {
      return this.baseClient.get<FunctionMetadataResponse[]>(`/dt/${schema}/functions`);
    }
    async getProcedures(schema: string): Promise<FunctionMetadataResponse[]> {
      return this.baseClient.get<FunctionMetadataResponse[]>(`/dt/${schema}/procedures`);
    }
    async getTriggers(schema: string): Promise<FunctionMetadataResponse[]> {
      return this.baseClient.get<FunctionMetadataResponse[]>(`/dt/${schema}/triggers`);
    }
  }
