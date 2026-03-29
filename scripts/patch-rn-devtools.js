#!/usr/bin/env node

"use strict";

const fs = require("fs");
const path = require("path");

const targetFile = path.join(
  __dirname,
  "..",
  "node_modules",
  "@react-native",
  "dev-middleware",
  "dist",
  "createDevMiddleware.js",
);

if (!fs.existsSync(targetFile)) {
  process.exit(0);
}

const source = fs.readFileSync(targetFile, "utf8");
const from =
  "    enableStandaloneFuseboxShell: config.enableStandaloneFuseboxShell ?? true,";
const to =
  "    enableStandaloneFuseboxShell: config.enableStandaloneFuseboxShell ?? false,";

if (!source.includes(from)) {
  process.exit(0);
}

fs.writeFileSync(targetFile, source.replace(from, to), "utf8");
