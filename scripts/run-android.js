#!/usr/bin/env node

"use strict";

const { spawnSync } = require("child_process");

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    stdio: "inherit",
    ...options,
  });
}

function runCapture(command, args) {
  return spawnSync(command, args, {
    encoding: "utf8",
  });
}

const devicesResult = runCapture("adb", ["devices"]);

if (devicesResult.status === 0 && devicesResult.stdout) {
  const devices = devicesResult.stdout
    .split("\n")
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.split(/\s+/))
    .filter((parts) => parts[1] === "device")
    .map((parts) => parts[0]);

  for (const device of devices) {
    run("adb", ["-s", device, "reverse", "tcp:8081", "tcp:8081"]);
  }
}

const cliArgs = process.argv.slice(2);
const androidResult = run(
  "node",
  ["./node_modules/react-native/cli.js", "run-android", ...cliArgs],
  { cwd: process.cwd() },
);

process.exit(androidResult.status ?? 1);
