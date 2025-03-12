import { log } from "../tools/logging";
import { SchemaMetadata, TypeGenerator } from "./types";

export class MetadataGen {
  constructor(private schemaMetadata: SchemaMetadata[]) {}

  async json(): Promise<void> {
    log.info("Generating JSON metadata...");
    new TypeGenerator().genJson(this.schemaMetadata);
    log.success("JSON metadata generated successfully");
  }

  async ts(): Promise<void> {
    log.info("Starting type generation...");
    await new TypeGenerator().genTsTypes(this.schemaMetadata);
    log.success("Type generation completed successfully");
  }
}
