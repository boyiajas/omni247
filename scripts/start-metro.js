#!/usr/bin/env node

"use strict";

const path = require("path");

const devMiddlewarePackagePath = require.resolve(
  "@react-native/dev-middleware/package.json",
);
const createDevMiddlewarePath = path.join(
  path.dirname(devMiddlewarePackagePath),
  "dist/createDevMiddleware.js",
);
const createDevMiddlewareModule = require(createDevMiddlewarePath);
const originalCreateDevMiddleware = createDevMiddlewareModule.default;

createDevMiddlewareModule.default = function createDevMiddlewarePatched(
  options = {},
) {
  return originalCreateDevMiddleware({
    ...options,
    unstable_experiments: {
      ...(options.unstable_experiments ?? {}),
      enableStandaloneFuseboxShell: false,
    },
  });
};

require("@react-native-community/cli").run();
