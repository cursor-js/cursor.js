// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "core-api/click.mdx": () => import("../content/docs/core-api/click.mdx?collection=docs"), "core-api/do.mdx": () => import("../content/docs/core-api/do.mdx?collection=docs"), "core-api/hover.mdx": () => import("../content/docs/core-api/hover.mdx?collection=docs"), "core-api/if.mdx": () => import("../content/docs/core-api/if.mdx?collection=docs"), "core-api/stop.mdx": () => import("../content/docs/core-api/stop.mdx?collection=docs"), "core-api/until.mdx": () => import("../content/docs/core-api/until.mdx?collection=docs"), "core-api/wait.mdx": () => import("../content/docs/core-api/wait.mdx?collection=docs"), "plugins/clicksound.mdx": () => import("../content/docs/plugins/clicksound.mdx?collection=docs"), "plugins/custom-plugins.mdx": () => import("../content/docs/plugins/custom-plugins.mdx?collection=docs"), "plugins/indicator.mdx": () => import("../content/docs/plugins/indicator.mdx?collection=docs"), "plugins/logging.mdx": () => import("../content/docs/plugins/logging.mdx?collection=docs"), "plugins/ripple.mdx": () => import("../content/docs/plugins/ripple.mdx?collection=docs"), "plugins/theme.mdx": () => import("../content/docs/plugins/theme.mdx?collection=docs"), }),
};
export default browserCollections;