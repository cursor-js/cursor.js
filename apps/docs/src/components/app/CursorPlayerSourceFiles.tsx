import { DynamicCodeBlock } from 'fumadocs-ui/components/dynamic-codeblock';

import { readRegistryItem } from '@/lib/registry';

function getLanguage(filePath: string) {
  if (filePath.endsWith('.tsx')) {
    return 'tsx';
  }

  if (filePath.endsWith('.ts')) {
    return 'ts';
  }

  return 'text';
}

export async function CursorPlayerSourceFiles() {
  const item = await readRegistryItem('cursor-player');

  if (!item) {
    return null;
  }

  return (
    <div className="mt-4 space-y-6">
      {item.files.map((file) => (
        <div key={file.target} className="overflow-hidden rounded-2xl border border-border/70">
          <div className="border-b border-border/70 bg-muted/30 px-4 py-2 text-sm font-medium text-foreground">
            {file.target}
          </div>
          <DynamicCodeBlock
            lang={getLanguage(file.target)}
            code={file.content}
            codeblock={{
              allowCopy: true,
              className: 'my-0 rounded-none border-0 bg-transparent shadow-none',
              viewportProps: {
                className: 'max-h-none bg-transparent px-2 py-4',
              },
            }}
          />
        </div>
      ))}
    </div>
  );
}
