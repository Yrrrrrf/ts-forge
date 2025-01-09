// src/types/registry.ts
import fs from 'fs';
import path from 'path';

/**
 * Dynamically load all generated schema types
 */
export function loadSchemaTypes() {
    const genPath = path.join(__dirname, '../gen');
    const registry: Record<string, unknown> = {};

    // Check if gen directory exists
    if (!fs.existsSync(genPath)) {
        return registry;
    }

    // Read all schema type files
    const files = fs.readdirSync(genPath)
        .filter(file => file.startsWith('types-') && file.endsWith('.ts'));

    // Import each schema's types
    files.forEach(file => {
        const schemaName = file.replace('types-', '').replace('.ts', '');
        const schemaTypes = require(`../gen/${file}`);
        registry[schemaName] = schemaTypes;
    });

    return registry;
}

/**
 * Get available schema names
 */
export function getAvailableSchemas(): string[] {
    const genPath = path.join(__dirname, '../gen');
    
    if (!fs.existsSync(genPath)) {
        return [];
    }

    return fs.readdirSync(genPath)
        .filter(file => file.startsWith('types-') && file.endsWith('.ts'))
        .map(file => file.replace('types-', '').replace('.ts', ''));
}

/**
 * Check if a schema is available
 */
export function isSchemaAvailable(schema: string): boolean {
    const filePath = path.join(__dirname, '../gen', `types-${schema}.ts`);
    return fs.existsSync(filePath);
}