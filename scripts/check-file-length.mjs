#!/usr/bin/env node

import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

const WARNING_LIMIT = 200;
const ERROR_LIMIT = 300;

function countLines(filePath) {
  const content = readFileSync(filePath, "utf-8");
  return content.split("\n").length;
}

function scanDirectory(dir, results = []) {
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      if (!entry.startsWith(".") && entry !== "node_modules" && entry !== "dist" && entry !== "build") {
        scanDirectory(fullPath, results);
      }
    } else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
      results.push(fullPath);
    }
  }

  return results;
}

const srcFiles = scanDirectory("src");
const screenFiles = scanDirectory("screens");
const componentFiles = scanDirectory("components");
const navigationFiles = scanDirectory("navigation");

const allFiles = [...srcFiles, ...screenFiles, ...componentFiles, ...navigationFiles];

let hasWarnings = false;
let hasErrors = false;

console.log("📏 Checking file lengths...\n");

for (const file of allFiles) {
  const lines = countLines(file);

  if (lines > ERROR_LIMIT) {
    console.error(`❌ ERROR: ${file} has ${lines} lines (limit: ${ERROR_LIMIT})`);
    hasErrors = true;
  } else if (lines > WARNING_LIMIT) {
    console.warn(`⚠️  WARNING: ${file} has ${lines} lines (recommended: <${WARNING_LIMIT})`);
    hasWarnings = true;
  }
}

if (!hasErrors && !hasWarnings) {
  console.log("✅ All files are within acceptable length limits");
  process.exit(0);
} else if (hasErrors) {
  console.error("\n❌ Build failed: Files exceed maximum length limit");
  process.exit(1);
} else {
  console.log("\n✅ Check passed with warnings");
  process.exit(0);
}
