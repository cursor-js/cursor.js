import defaultMdxComponents from 'fumadocs-ui/mdx';
import type { MDXComponents } from 'mdx/types';
import { TypeTable } from 'fumadocs-ui/components/type-table';
import {
  ThemeDemo,
  RippleDemo,
  IndicatorDemo,
  ClickSoundDemo,
  LoggingDemo,
} from '@/components/app/PluginDemos';

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    TypeTable,
    ThemeDemo,
    RippleDemo,
    IndicatorDemo,
    ClickSoundDemo,
    LoggingDemo,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
