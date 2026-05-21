import { NextResponse } from 'next/server';

import { readRegistryIndex, readRegistryItem } from '@/lib/registry';

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ slug: string }>;
  },
) {
  const { slug } = await context.params;

  if (!slug.endsWith('.json')) {
    return badRequest('Registry endpoints must end with .json.');
  }

  const registryName = slug.slice(0, -'.json'.length);

  if (!registryName) {
    return badRequest('Missing registry name.');
  }

  if (registryName === 'index') {
    const registryIndex = await readRegistryIndex();
    return NextResponse.json(registryIndex);
  }

  const registryItem = await readRegistryItem(registryName);

  if (!registryItem) {
    return badRequest(`Registry item "${registryName}" was not found.`, 404);
  }

  return NextResponse.json(registryItem);
}
