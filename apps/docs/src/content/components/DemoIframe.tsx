import type { ComponentProps } from 'react';

type DemoIframeProps = Omit<ComponentProps<'iframe'>, 'scrolling'>;

export function DemoIframe(props: DemoIframeProps) {
  return <iframe scrolling="no" {...props} />;
}
