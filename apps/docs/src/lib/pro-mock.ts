// This acts as a dummy/mock library when open source developers clone the cursor.js
// repository but lack access to the proprietary @cursor.js/pro package.
// The TypeScript compiler & Webpack will alias to this file to prevent build failures.

// Make a catch-all proxy so any imported variable correctly maps to a no-op function / empty object
const mockProxy = new Proxy(
  {},
  {
    get: function (target, prop) {
      if (prop === '__esModule') return true;
      if (prop === 'default') return mockProxy;
      return new Proxy(function () {}, {
        get: function (t, p) {
          return t[p];
        },
      });
    },
  },
);

// Since Next.js uses strict ES modules occasionally, we export common placeholders.
// You might need to add specific named exports here if Webpack complains about
// 'export "SpecificPlugin" was not found in "@cursor.js/pro"'.
export const ProPlugin = () => {};

export default mockProxy;
