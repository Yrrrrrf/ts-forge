# <div align="center"><img src="./resources/img/knife-sheath.png" alt="TS Forge Icon" width="128" height="128"><div align="center">TS Forge</div></div>

[![npm pkg](https://badge.fury.io/js/ts-forge.svg)](https://www.npmjs.com/package/ts-forge)
[![GitHub repo](https://img.shields.io/badge/GitHub-ts--forge-blue)](https://github.com/Yrrrrrf/ts-forge)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://choosealicense.com/licenses/mit/)

## Overview

TS FORGE is a TypeScript library designed to handle API response types efficiently. It provides a robust type system for managing API responses, reducing boilerplate code, and ensuring type safety throughout your application.

This pkg is built with TypeScript in mind, offering full TypeScript support, runtime type validation, and error handling. It is lightweight and dependency-free.

## Considerations

**The current 'API route' convention is followed by the one declared by the [API-Forge](https://pypi.org/project/api-forge/) python library (to manage API routes for [FastAPI](https://fastapi.tiangolo.com/) projects).**

## Key Features

- **Type-Safe API Responses**: Automatically handle API response types with full TypeScript support
- **Runtime Type Validation**: Validate API responses at runtime against your TypeScript types
- **Error Handling**: Comprehensive error handling with type-safe error responses
- **Type Inference**: Leverage TypeScript's type inference for better IDE support
- **Zero Dependencies**: Lightweight implementation with no external runtime dependencies
- **Bun Optimized**: Built with Bun in mind for optimal performance
- **ESM Support**: Full support for ECMAScript modules
- **Type Declaration Files**: Complete `.d.ts` files for perfect TypeScript integration

## Installation

Using bun:
```bash
bun add ts-forge  # using bun
npm install ts-forge  # using npm
yarn add ts-forge  # using yarn
# deno install --unstable --import-map=import_map.json --name=ts-forge https://deno.land/x/ts-forge/mod.ts  # using deno
```

## Quick Start

```typescript
import { BaseClient, TsForge } from 'ts-forge';

// Initialize and setup
const baseClient = new BaseClient("localhost:8000/");
const forge = new TsForge(baseClient);

// Generate types
forge.genTs();  // Generate TypeScript types
forge.genMetadataJson();  // Generate metadata JSON
```

## Usage Examples

### Basic CRUD Operations

```typescript
// Get table operations with type inference
const profileOps = await forge.getTableOperations('account', 'profile');

// Create
const newProfile = await profileOps.create({
    username: "newuser",
    email: "user@example.com",
    full_name: "Test User",
    status: "active"
});

// Read
const profile = await profileOps.findOne(newProfile.id);

// Query with filters
const activeProfiles = await profileOps.findMany({ 
    where: { status: "active" },
    orderBy: { username: "asc" }
});

// Update & Delete
await profileOps.update(profile.id, { status: "inactive" });
await profileOps.delete(profile.id);
```

### Testing CRUD Operations

```typescript
import { testForgeSetup, runTableTests } from 'ts-forge';

async function runStudentTests() {
    const forge = await testForgeSetup();

    // Get active program
    const programs = await (await forge.getTableOperations('academic', 'program'))
        .findMany({ where: { is_active: true } });

    if (!programs.length) throw new Error('No active programs found');

    // Run student tests
    const sampleStudent = {
        first_name: `Test${Date.now()}`,
        last_name: "Student",
        enrollment_date: new Date().toISOString().split('T')[0],
        program_id: programs[0].id,
        is_active: true
    };

    await runTableTests(forge, 'student', 'student', sampleStudent);
}
```

### Type Generation

```typescript
import { appDt, BaseClient, TsForge } from 'ts-forge';

function main() {
    appDt();  // Display application info
    
    const forge = new TsForge(new BaseClient("localhost:8000"));
    
    forge.genTs();  // Generate TypeScript types
    forge.genMetadataJson();  // Generate metadata JSON
}

main();
```

## Available Operations

### Table Operations
- `create(data)`: Create a new record
- `findOne(id)`: Find a single record by ID
- `findMany(filter)`: Find records matching filter criteria
- `update(id, data)`: Update a record
- `delete(id)`: Delete a record

### Filter Options
```typescript
interface FilterOptions {
    where?: Record<string, any>;
    orderBy?: Record<string, "asc" | "desc">;
    limit?: number;
    offset?: number;
}
```

### Test Utilities
- `testForgeSetup()`: Initialize and test forge connection
- `runTableTests()`: Run CRUD tests for a table
- `getTableOperations()`: Get typed CRUD operations for a table

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.