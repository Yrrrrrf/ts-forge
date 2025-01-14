// ts-forge/src/tools/fs-ops.ts
export async function writeFiles(operations: { path: string, content: string }[]) {
    if (typeof window === 'undefined') {
        // Node environment
        const fs = await import('fs/promises');
        await Promise.all(operations.map(op => fs.writeFile(op.path, op.content)));
    }
    // todo: Look for a way to make this work on the browser... I mean
    // todo: Not necessarily writing files, but at least reading them...
    // todo: And being able to generate the ts-types to use them in the browser...
    // In browser - no-op (we only generate types during build)
}

export async function ensureDir(path: string) {
    if (typeof window === 'undefined') {
        const fs = await import('fs/promises');
        await fs.mkdir(path, { recursive: true });
    }
}

export async function removeDir(path: string) {
    if (typeof window === 'undefined') {
        const fs = await import('fs/promises');
        await fs.rm(path, { recursive: true, force: true });
    }
}
