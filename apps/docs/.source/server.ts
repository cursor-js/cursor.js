// @ts-nocheck
import * as __fd_glob_8 from "../content/docs/core-api/wait.mdx?collection=docs"
import * as __fd_glob_7 from "../content/docs/core-api/until.mdx?collection=docs"
import * as __fd_glob_6 from "../content/docs/core-api/stop.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/core-api/if.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/core-api/hover.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/core-api/do.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/core-api/click.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/index.mdx?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/core-api/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"core-api/meta.json": __fd_glob_0, }, {"index.mdx": __fd_glob_1, "core-api/click.mdx": __fd_glob_2, "core-api/do.mdx": __fd_glob_3, "core-api/hover.mdx": __fd_glob_4, "core-api/if.mdx": __fd_glob_5, "core-api/stop.mdx": __fd_glob_6, "core-api/until.mdx": __fd_glob_7, "core-api/wait.mdx": __fd_glob_8, });