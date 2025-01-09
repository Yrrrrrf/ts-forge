import { baseClient } from '../client/base';
import { mapPgTypeToTs } from '../tools/type-maps'; // Existing type-mapping function

export interface ApiColumnMetadata {
  name: string;
  type: string;
  is_primary_key: boolean;
  is_foreign_key: boolean;
}

export interface ApiTableMetadata {
  name: string;
  columns: ApiColumnMetadata[];
}

export interface ApiSchemaMetadata {
  name: string;
  tables: Record<string, ApiTableMetadata>;
}

// todo: Use the same variable instead of duplicating the function
export async function fetchSchemaMetadata(): Promise<ApiSchemaMetadata[]> {
  return await baseClient.get<ApiSchemaMetadata[]>('/dt/schemas');
}

export function generateInterface(table: ApiTableMetadata): string {
  const properties = table.columns.map(column => {
    const tsType = mapPgTypeToTs(column.type);
    const optional = column.is_primary_key ? '' : '?'; // Primary keys are mandatory
    return `  ${column.name}${optional}: ${tsType};`;
  });

  return `export interface ${table.name} {\n${properties.join('\n')}\n}`;
}
