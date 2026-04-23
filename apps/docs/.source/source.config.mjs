// source.config.ts
import { defineDocs, defineConfig } from "fumadocs-mdx/config";
import { remarkAutoTypeTable, createGenerator } from "fumadocs-typescript";
var generator = createGenerator();
var docs = defineDocs({
  dir: "content/docs"
});
var source_config_default = defineConfig({
  mdxOptions: {
    remarkPlugins: [[remarkAutoTypeTable, { generator }]]
  }
});
export {
  source_config_default as default,
  docs
};
