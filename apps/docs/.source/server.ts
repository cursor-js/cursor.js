// @ts-nocheck
import * as __fd_glob_25 from "../content/docs/plugins/theme.mdx?collection=docs"
import * as __fd_glob_24 from "../content/docs/plugins/ripple.mdx?collection=docs"
import * as __fd_glob_23 from "../content/docs/plugins/logging.mdx?collection=docs"
import * as __fd_glob_22 from "../content/docs/plugins/indicator.mdx?collection=docs"
import * as __fd_glob_21 from "../content/docs/plugins/custom-plugins.mdx?collection=docs"
import * as __fd_glob_20 from "../content/docs/plugins/clicksound.mdx?collection=docs"
import * as __fd_glob_19 from "../content/docs/core-api/waitForEvent.mdx?collection=docs"
import * as __fd_glob_18 from "../content/docs/core-api/wait.mdx?collection=docs"
import * as __fd_glob_17 from "../content/docs/core-api/use.mdx?collection=docs"
import * as __fd_glob_16 from "../content/docs/core-api/until.mdx?collection=docs"
import * as __fd_glob_15 from "../content/docs/core-api/type.mdx?collection=docs"
import * as __fd_glob_14 from "../content/docs/core-api/stop.mdx?collection=docs"
import * as __fd_glob_13 from "../content/docs/core-api/setState.mdx?collection=docs"
import * as __fd_glob_12 from "../content/docs/core-api/setConfig.mdx?collection=docs"
import * as __fd_glob_11 from "../content/docs/core-api/pause.mdx?collection=docs"
import * as __fd_glob_10 from "../content/docs/core-api/next.mdx?collection=docs"
import * as __fd_glob_9 from "../content/docs/core-api/move.mdx?collection=docs"
import * as __fd_glob_8 from "../content/docs/core-api/if.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/core-api/hover.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/core-api/do.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/core-api/destroy.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/core-api/cursor.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/core-api/click.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/index.mdx?collection=docs"
import { default as __fd_glob_1 } from "../content/docs/plugins/meta.json?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/core-api/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"core-api/meta.json": __fd_glob_0, "plugins/meta.json": __fd_glob_1, }, {"index.mdx": __fd_glob_2, "core-api/click.mdx": __fd_glob_3, "core-api/cursor.mdx": __fd_glob_4, "core-api/destroy.mdx": __fd_glob_5, "core-api/do.mdx": __fd_glob_6, "core-api/hover.mdx": __fd_glob_7, "core-api/if.mdx": __fd_glob_8, "core-api/move.mdx": __fd_glob_9, "core-api/next.mdx": __fd_glob_10, "core-api/pause.mdx": __fd_glob_11, "core-api/setConfig.mdx": __fd_glob_12, "core-api/setState.mdx": __fd_glob_13, "core-api/stop.mdx": __fd_glob_14, "core-api/type.mdx": __fd_glob_15, "core-api/until.mdx": __fd_glob_16, "core-api/use.mdx": __fd_glob_17, "core-api/wait.mdx": __fd_glob_18, "core-api/waitForEvent.mdx": __fd_glob_19, "plugins/clicksound.mdx": __fd_glob_20, "plugins/custom-plugins.mdx": __fd_glob_21, "plugins/indicator.mdx": __fd_glob_22, "plugins/logging.mdx": __fd_glob_23, "plugins/ripple.mdx": __fd_glob_24, "plugins/theme.mdx": __fd_glob_25, });