import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import * as TabsComponents from 'fumadocs-ui/components/tabs';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import {
  ThemeDemo,
  RippleDemo,
  IndicatorDemo,
  SoundDemo,
  LoggingDemo,
} from '@/components/app/PluginDemos';
import {
  CursorPlayerOverlayShowcase,
  CursorPlayerShowcase,
} from '@/components/app/CursorPlayerShowcase';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    ...TabsComponents,
    TypeTable,
    ThemeDemo,
    RippleDemo,
    IndicatorDemo,
    SoundDemo,
    LoggingDemo,
    CursorPlayerShowcase,
    CursorPlayerOverlayShowcase,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
