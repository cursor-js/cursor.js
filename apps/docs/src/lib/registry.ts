import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

interface RegistryFileDefinition {
  path: string;
  type: string;
  target: string;
}

interface RegistryItemDefinition {
  name: string;
  type: string;
  title?: string;
  description?: string;
  dependencies?: string[];
  registryDependencies?: string[];
  files: RegistryFileDefinition[];
}

interface RegistryIndexDefinition {
  $schema?: string;
  name: string;
  homepage?: string;
  items: RegistryItemDefinition[];
}

interface RegistryFilePayload extends RegistryFileDefinition {
  content: string;
}

export interface RegistryItemPayload extends Omit<RegistryItemDefinition, 'files'> {
  files: RegistryFilePayload[];
}

const moduleDirectory = path.dirname(fileURLToPath(import.meta.url));
const docsRoot = path.resolve(moduleDirectory, '..', '..');
const registryPath = path.join(docsRoot, 'registry.json');

let registryIndexPromise: Promise<RegistryIndexDefinition> | null = null;

async function readRegistryIndexSource() {
  const registrySource = await readFile(registryPath, 'utf8');

  return JSON.parse(registrySource) as RegistryIndexDefinition;
}

export async function readRegistryIndex() {
  registryIndexPromise ??= readRegistryIndexSource();
  return registryIndexPromise;
}

async function readRegistryFileContent(filePath: string) {
  if (!filePath) {
    throw new Error('Registry file path is missing.');
  }

  return readFile(path.join(docsRoot, filePath), 'utf8');
}

export async function readRegistryItem(name: string) {
  const registryIndex = await readRegistryIndex();
  const item = registryIndex.items.find((candidate) => candidate.name === name);

  if (!item) {
    return null;
  }

  const files = await Promise.all(
    item.files.map(async (file) => ({
      ...file,
      content: await readRegistryFileContent(file.path),
    })),
  );

  return {
    ...item,
    files,
  } satisfies RegistryItemPayload;
}
