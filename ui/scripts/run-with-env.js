#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

function applyEnvFile(relativePath) {
  if (!relativePath) {
    return;
  }

  const resolvedPath = path.resolve(__dirname, "..", relativePath);
  if (!fs.existsSync(resolvedPath)) {
    console.warn(`[run-with-env] Optional env file not found: ${relativePath}`);
    return;
  }

  const fileContent = fs.readFileSync(resolvedPath, "utf8");
  const lines = fileContent.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const equalsIndex = line.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = line.substring(0, equalsIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    let value = line.substring(equalsIndex + 1).trim();
    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

function ensureLegacyOpenSSL() {
  const flag = "--openssl-legacy-provider";
  const current = process.env.NODE_OPTIONS || "";
  const hasFlag =
    current
      .split(/\s+/)
      .filter(Boolean)
      .includes(flag) || process.execArgv.includes(flag);

  if (hasFlag || process.env.RUN_WITH_ENV_CHILD === "1") {
    if (!hasFlag && process.env.RUN_WITH_ENV_CHILD === "1") {
      console.warn(
        "[run-with-env] WARN: expected openssl legacy flag to be present in child process"
      );
    }
    return;
  }

  const nextEnv = { ...process.env };
  nextEnv.NODE_OPTIONS = current ? `${current} ${flag}` : flag;
  nextEnv.RUN_WITH_ENV_CHILD = "1";

  const { spawnSync } = require("child_process");
  const result = spawnSync(
    process.execPath,
    [__filename, ...process.argv.slice(2)],
    {
      stdio: "inherit",
      env: nextEnv,
    }
  );

  const exitCode = result.status ?? 1;
  process.exit(exitCode);
}

function runReactScripts(action) {
  switch (action) {
    case "start":
      require("react-scripts/scripts/start");
      return;
    case "build":
      require("react-scripts/scripts/build");
      return;
    case "test":
      require("react-scripts/scripts/test");
      return;
    default:
      console.error(`[run-with-env] Unknown action: ${action}`);
      process.exit(1);
  }
}

function main() {
  const [, , action, envFile] = process.argv;

  if (!action) {
    console.error("Usage: node scripts/run-with-env.js <start|build|test> [env-file]");
    process.exit(1);
  }

  applyEnvFile(envFile);
  ensureLegacyOpenSSL();
  runReactScripts(action);
}

main();
